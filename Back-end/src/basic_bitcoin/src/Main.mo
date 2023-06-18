import Text "mo:base/Text";

import BitcoinWallet "BitcoinWallet";
import BitcoinApi "BitcoinApi";
import Types "Types";
import Utils "Utils";
/*****************************************************/
import Cycles "mo:base/ExperimentalCycles";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Nat "mo:base/Nat";
import Map "mo:base/HashMap";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Option "mo:base/Option";
import CkBtcLedger "canister:ckbtc_ledger";
import InvoiceTypes "./Invoice";
import { toAccount; toSubaccount; createInvoice;toSubaccountArray } "./ckBTC_Utils";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Error "mo:base/Error";
import AID "./util/AccountIdentifier";


/*****************************************************/


actor class BasicBitcoin(_network : Types.Network, _owner: Principal) = this {
  type GetUtxosResponse = Types.GetUtxosResponse;
  type MillisatoshiPerByte = Types.MillisatoshiPerByte;
  type SendRequest = Types.SendRequest;
  type Network = Types.Network;
  type BitcoinAddress = Types.BitcoinAddress;
  type Satoshi = Types.Satoshi;

  let limit = 50_000_000_000_000;
  let limitCycle = 10;

  // The Bitcoin network to connect to.
  //
  // When developing locally this should be `Regtest`.
  // When deploying to the IC this should be `Testnet`.
  // `Mainnet` is currently unsupported.
  stable let NETWORK : Network = _network;

  // The derivation path to use for ECDSA secp256k1.
  let DERIVATION_PATH : [[Nat8]] = [];

  // The ECDSA key name.
  let KEY_NAME : Text = switch NETWORK {
    // For local development, we use a special test key with dfx.
    case (#Regtest) "dfx_test_key";
    // On the IC we're using a test ECDSA key.
    case _ "test_key_1"
  };

  /// Returns the balance of the given Bitcoin address.
  public func get_balance(address : BitcoinAddress) : async Satoshi {
    await BitcoinApi.get_balance(NETWORK, address)
  };
  
/******************************************************************************/
  type TaprootAddress = {
    bitcoin_address: Text;
  };

  type loanDetails = {
    inscriptionID: Text;
    inscription: Text;
    loan_amount: Text;
    loan_period: Text;
    loan_maturity: Text;
  };



  private stable var owner_ : Principal = _owner;

  type taproot_address = Text;
  func isEq(x: Nat, y: Nat): Bool { x == y };
  func isEqP(x: Principal, y: Principal): Bool { x == y };

  let loanDB = Map.HashMap<Principal, [loanDetails]>(0, isEqP,  Principal.hash);
  let loanInscription = Map.HashMap<Text, Text>(0, Text.equal,Text.hash);

  let addressBook = Map.HashMap<Nat, Text>(0, isEq,  Nat32.fromNat);
  let address2Index = Map.HashMap<Text, Nat>(0, Text.equal,  Text.hash);

  var addressCount : Nat = 0;
  var usedAddressCount : Nat = 0;

  stable var accountIDCount : Nat8 = 0;
  stable var secondBit : Nat8 = 0;


  //let withDrawRequest = Map.HashMap<Nat, Text>(0, isEq,  Nat32.fromNat);
  let withDrawWallet  = Map.HashMap<Nat, Text>(0, isEq,  Nat32.fromNat);
  let withDrawRequest = Map.HashMap<Text, Text>(0, Text.equal,Text.hash);

  var withDrawCount : Nat = 0;



  let ordinals = Map.HashMap<Text, [Text]>(0, Text.equal,Text.hash);
  let ordinalIds = Map.HashMap<Text, [Text]>(0, Text.equal,Text.hash);
  let ordinal2Holder = Map.HashMap<Text, Text>(0, Text.equal,Text.hash); // 1 to 1 Ordinals - Holders


  let ordinalsICP = Map.HashMap<Principal, [Text]>(0, isEqP,  Principal.hash);
  let OnePrincipalOneBitcoinAddress = Map.HashMap<Principal, Text>(0, isEqP,  Principal.hash);

/**********************************************************************/

  public shared(msg) func setAddress(address:Text): async Text {

    var tokens = OnePrincipalOneBitcoinAddress.get(msg.caller);

    var index = address2Index.get(address);

    var result = "Address Added";

    switch (index) {
    case (?index) {       

        result := "Address,already exist";        
    };
    case (_) {

        addressBook.put(addressCount, address); 
        address2Index.put(address,addressCount);
        addressCount := addressCount + 1;        
    }

    };  
    return result;
  };

  public shared ({ caller })  func getAccountID(user: Text) : async Text {
      
      return AID.fromPrincipal(Principal.fromActor(this),toSubaccountArray(Principal.fromText(user)));
  };    

  public shared ({ caller }) func getInvoice() : async Text {
     
      return AID.fromPrincipal(Principal.fromActor(this),toSubaccountArray(caller));
  }; 


  //toSubaccountArray

 public shared ({ caller }) func checkBalance() : async Nat {
      
    // check ckBTC balance of the callers dedicated account
    let balance = await CkBtcLedger.icrc1_balance_of(
          {
            owner = Principal.fromActor(this);
            subaccount = null;
          }
        );

      return balance;
  };  


  /***************************************************************************************/
  /*public shared ({ caller }) func getInvoice(amount : Nat) : async InvoiceTypes.Invoice
  {
    createInvoice(toAccount({ caller; canister = Principal.fromActor(this) }), amount);
  };*/
  /***************************************************************************************/

  public shared ({ caller }) func getCookie() : async Result.Result<Text, Text> {

    // check ckBTC balance of the callers dedicated account
    let balance = await CkBtcLedger.icrc1_balance_of(
      toAccount({ caller; canister = Principal.fromActor(this) })
    );

    if (balance < 100) {
      return #err("Not enough funds available in the Account. Make sure you send at least 100 ckSats.");
    };

    try {
      // if enough funds were sent, move them to the canisters default account
      let transferResult = await CkBtcLedger.icrc1_transfer(
        {
          amount = balance -10;
          from_subaccount = ?toSubaccount(caller);
          created_at_time = null;
          fee = ?10;
          memo = null;
          to = {
            owner = Principal.fromActor(this);
            subaccount = null;
          };
        }
      );

      switch (transferResult) {
        case (#Err(transferError)) {
          return #err("Couldn't transfer funds to default account:\n" # debug_show (transferError));
        };
        case (_) {};
      };
    } catch (error : Error) {
      return #err("Reject message: " # Error.message(error));
    };

    return #ok("🪙: " # "Thank you");
  };
 /***************************************************************************/

  public shared(msg) func myPrincipal(): async Principal {
    return msg.caller;
  };  

  public query func getAddressCount() : async Nat {
      return addressCount;
  };
  
  public query func getAddress(id : Nat) : async ?Text {
    addressBook.get(id);
  };
    
  public query func getAllAddress() : async [(Nat, Text)]  {
    Iter.toArray(addressBook.entries());
  };

  public query func ordinal2Holders() : async [(Text, Text)]  {
    Iter.toArray(ordinal2Holder.entries());
  };


  public query func getUsedAddressCount() : async Nat {
      return usedAddressCount;
  };

  public shared(msg) func getBTCAddress(): async Text {

    var newAddress = Option.unwrap(addressBook.get(usedAddressCount));

    var userBTCAddress = OnePrincipalOneBitcoinAddress.get(msg.caller);
    var temp_userBTCAddress = "0";
    switch (userBTCAddress) {
        case (?userBTCAddress) {
            temp_userBTCAddress := Option.unwrap(OnePrincipalOneBitcoinAddress.get(msg.caller));
        };
        case (_) {
            temp_userBTCAddress := "0";
        }
    };  

    var resultAddress = newAddress;

    // When there is an address already don't assign one more address

    // One Principal = One BTC Address only
    if(temp_userBTCAddress.size() == 1)
    {
        ordinalsICP.put(msg.caller, Array.make(newAddress));
        OnePrincipalOneBitcoinAddress.put(msg.caller, newAddress);
        usedAddressCount := usedAddressCount + 1;      
        resultAddress := newAddress;
    }
    else
    {
      resultAddress := temp_userBTCAddress;
    };
    
    return resultAddress;
  };

  public shared(msg) func myBTCAddress(): async [Text] {
      var tokens = ordinalsICP.get(msg.caller);

      switch (tokens) {
          case (?tokens) {
              return tokens;
          };
          case (_) {
              return [];
          }
      }
  };

  public shared(msg) func userBTCAddress(user: Principal): async [Text] {
      var tokens = ordinalsICP.get(user);

      switch (tokens) {
          case (?tokens) {
              return tokens;
          };
          case (_) {
              return [];
          }
      }
  };

  //Get the inscription
  public query func getMyInscriptionId(address:Text) : async [Text]  {

    var ordinals_ 	  = ordinalIds.get(address);

    switch (ordinals_) {
        case (?ordinals_) {

            return ordinals_;

        };
        case (_) {
          
          var _empty = [];
          return _empty;
           
        };
    };    
  };

/*
https://ordinals.com/inscription/63f9669e0ca58395cecd635f185f8b7660f93935e6582850c4a4459a2c9442a9i0
https://ordinals.com/inscription/39b748cc0211f0561dc873a9f055e30d3d4537fb28b77a72e3221f297735d61bi0
https://ordinals.com/inscription/0079fd8c76e7bb76e15c9bc130eb2adace62e62344cc556755ddeff7a6f1453ai0
*/
  public query func getMyInscriptions(address:Text) : async [Text]  {

    var ordinals_ 	  = ordinals.get(address);

    switch (ordinals_) {
        case (?ordinals_) {

            return ordinals_;

        };
        case (_) {
          
          var _empty = [];
          return _empty;
           
        };
    };    
  };

  public shared(msg) func setWithdrawOrdinals(userWallet_: Text, loanInscriptionId_: Text, userPrincipal_:Text): async Text {
  
     
      var isWithDrawRequestExists = withDrawRequest.get(loanInscriptionId_);
      

      var result = "";

      var isExists : Bool = false;


      switch (isWithDrawRequestExists) {
        case (?isWithDrawRequestExists) {
            isExists := true;
            result   := "Withdraw request exisits for the  " # isWithDrawRequestExists;
         };
          case (_) {
            
       
	      withDrawRequest.put(loanInscriptionId_,userWallet_);
	      result   := "Withdraw request processed " # loanInscriptionId_;
            
          };
      };      

      return result;      
  };

  public shared(msg) func getWithdraw() : async [(Text, Text)]  {
      return Iter.toArray(withDrawRequest.entries());
  };
  public shared(msg) func getWith_draw(): async Text {

    var keys = "";
    for (key in withDrawRequest.keys()) {
      keys := key # "," # keys
    };
    return keys;
 
  };

  public shared(msg) func setLoanDetails(inscriptionid_: Text, inscription_: Text, loan_amount_:Text, loan_period_:Text, loan_maturity_:Text): async Text {

       let loanInfo = {
        inscriptionID = inscriptionid_;
        inscription = inscription_;
        loan_amount = loan_amount_;
        loan_period = loan_period_;
        loan_maturity = loan_maturity_;
      };

      var isLoanDetailsExists = loanInscription.get(inscriptionid_);

      var result = "";

      var isExists : Bool = false;


      switch (isLoanDetailsExists) {
        case (?isLoanDetailsExists) {
            isExists := true;
            result   := "Loan Details exisits for the  " # inscription_;
         };
          case (_) {
            isExists := false;

          };
      };      

      if(isExists == false)
      {
        var loanDetails_ 	      = loanDB.get(msg.caller);
        switch (loanDetails_) {
          case (?loanDetails_) {

          loanDB.put(msg.caller, Array.append(loanDetails_, [loanInfo]));
          loanInscription.put(inscriptionid_, loan_amount_);

          result := "Loan Appened";
          };
            case (_) {

          loanDB.put(msg.caller,Array.make(loanInfo));
          loanInscription.put(inscriptionid_, loan_amount_);

          result := "Loan Added";		
            };
        };
      };
      return result;      
  };

  public query func getAllKeys(): async Text {

    var keys = "";
    for (key in loanDB.keys()) {
      keys := Principal.toText(key) # "," # keys
    };
    return keys;
 
  };

  public query func getLoanDetails(address: Principal): async ?[loanDetails] {

    let loanInfo = {
      inscription = "0";
      loan_amount = "0";
      loan_period = "0";
      loan_maturity = "0";
      inscriptionID = "0";
    };

    var loanInfo_ = loanDB.get(address);

    switch (loanInfo_) {
        case (?loanInfo_) {
            return ?loanInfo_;
        };
        case (_) {
            return loanInfo_;
        };
    };  
  };

  public shared(msg) func clearInscriptions(address:Text): async Text {

	var tokens = ordinalIds.get(address);
	var result = "All the inscriptions cleared for the address " # address;

	switch (tokens) {
	case (?tokens) {
	    for (tokenId in Iter.range(0, tokens.size()-1)) {

		    var inscriptionID = tokens[tokenId];
		    ordinal2Holder.delete(inscriptionID);

	    };
	};
  case(_)
  {
    	result := "No inscriptions found";
   }
	};

	ordinals.delete(address);
	ordinalIds.delete(address);
	//ordinal2Holder.get(ins_id,address);


	return result;
  };

  public shared(msg) func setInscriptions(address:Text, url:Text, ins_id:Text): async Text {

  // Ordinals are stored by Bitcoin Address
	var ordinals_ 	      = ordinals.get(address);
	var ordinalids_       = ordinalIds.get(address);
	

	var result = "";

    var addOrdinals = false;
    
    // If the address exists in our canister then we should add the 
    // Ordinals otherwise we don't need to add the ordinals

    var index = address2Index.get(address);
    switch (index) {
      case (?index) {       

          result := "Address belong to us";     
          addOrdinals := true;   
      };
      case (_) {

          result := address # " -- No need to add this Ordinal " # ins_id;   
          addOrdinals := false;
          return result;     

      }
    };

    /*
    var inscriptionOwner 	  = ordinal2Holder.get(ins_id);

    switch (inscriptionOwner) {
      case (?inscriptionOwner) {       

          result := "Inscription owned by " # address;   
          addOrdinals := false;
      };
      case (_) {

          result := "All good";   
          addOrdinals := true;   

      }
    };*/

    if(addOrdinals)
    {
      // ordinal2Holder.put(ins_id,address);

      switch (ordinals_) {
        case (?ordinals_) {

        ordinals.put(address, Array.append(ordinals_, [url]));
        result := "Ordinals Appened";
          };
          case (_) {

        ordinals.put(address, Array.make(url));
        result := "Ordinals Added";		
          };
      };

      switch (ordinalids_) {
        case (?ordinalids_) {

        ordinalIds.put(address, Array.append(ordinalids_, [ins_id]));		
        result := "Ordinals Appened";
          };
          case (_) {

        ordinalIds.put(address, Array.make(ins_id));		
        result := "Ordinals Added";		
          };
      };      
    };
    return result;
  };
/*********************************************************************/
  public func acceptCycles() : async () {
      let available = Cycles.available();
      let accepted = Cycles.accept(available);
      assert (accepted == available);
  };

  public query func availableCycles() : async Nat {
      return Cycles.balance();
  };

  public func wallet_receive() : async { accepted: Nat64 } 
  {
      let available = Cycles.available();
      let accepted = Cycles.accept(Nat.min(available, limit));
      { accepted = Nat64.fromNat(accepted) };
  };
/********************************************************************/
};

