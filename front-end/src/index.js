import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from "@dfinity/auth-client";
import { sha224 } from '@dfinity/principal/lib/esm/utils/sha224';
import { getCrc32 } from '@dfinity/principal/lib/esm/utils/getCrc';
import { Principal } from "@dfinity/agent"; 
import {MyPrincipal} from '@dfinity/principal';
import { mooncatparser }  from "./bunny/bunnyparser.js";
import { bunnycolors }  from "./bunny/bunnycolors.js";

/********************************* */
import { idlFactory as icp_bunny_idl, canisterId as icp_bunny_id } from 'dfx-generated/prod_icpbunny';


// Canister Id as an example
const bunnyCanisterId = 'xkbqi-2qaaa-aaaah-qbpqq-cai';
const bitcoinCanisterId = 'cepwu-pyaaa-aaaal-acpiq-cai';

const punkCanisterId  = 'qcg3w-tyaaa-aaaah-qakea-cai';
const bunnyImageCanId = 'emtmi-oyaaa-aaaaf-qaecq-cai';
const financeCanisterID = 'hhf2l-iaaaa-aaaaf-qaeia-cai';

const storage = [];

storage[0] = 'efqhu-yqaaa-aaaaf-qaeda-cai';
storage[1] = 'ecrba-viaaa-aaaaf-qaedq-cai';
storage[2] = 'fp7fo-2aaaa-aaaaf-qaeea-cai';
storage[3] = 'fi6d2-xyaaa-aaaaf-qaeeq-cai';
storage[4] = 'fb5ig-bqaaa-aaaaf-qaefa-cai';

storage[5] = 'fg4os-miaaa-aaaaf-qaefq-cai';
storage[6] = 'ft377-naaaa-aaaaf-qaega-cai';
storage[7] = 'fu2zl-ayaaa-aaaaf-qaegq-cai';
storage[8] = 'f5zsx-wqaaa-aaaaf-qaeha-cai';
storage[9] = 'f2yud-3iaaa-aaaaf-qaehq-cai';
storage[10]= 'emtmi-oyaaa-aaaaf-qaecq-cai';  //Used in Stage0 Testing


const Breed = [];
Breed[0] = 'Pointed Beveren';   
   
const EarningCapacity = [];
EarningCapacity[0] = "2";
 

const LifeSpan = [];
LifeSpan[0] = "66";
 

const BreedingCapacity = [];
BreedingCapacity[0] = "10";
 

var rareIndex = 0;
var trait =  {
  "Breed": Breed[rareIndex], 
  "EarningCapacity": EarningCapacity[rareIndex], 
  "LifeSpan": LifeSpan[rareIndex], 
  "BreedingCapacity": BreedingCapacity[rareIndex],
  "Gender": true, 
  "Fertility": true, 
  "ThreeD_Breedable": false
  };

/***********************************************/

const connectionState = false;
var isSingleImage = false;


var co_ordinates = ["(9,-10)"];
var emptyTokens = [16500];


var ImageChange = [887];
var NFTImageCounter = 0;

const agent = new HttpAgent();
let principal = new Principal();
var i = 0;

let amountPaid = 0;
var price = 0.0;
let nextAccountID = 0;
let punkCount = 0;
var seconds = 0;
var rareBunnyEnabled = false;
var isPunkHolder = false;
var adoptInProgress = false;

let totalLength = emptyTokens.length;



var isPrincipalClaimed  = false;
const whitelist = [bitcoinCanisterId];


/********************************************************************************/
//      Bitcoin Bunny Starts here 
/********************************************************************************/

//bitcoinCanisterId
const bitcoinFactory = ({ IDL }) => {
  const BitcoinAddress = IDL.Text;
  const Satoshi = IDL.Nat64;

  const loanDetails = IDL.Record({
    'loan_amount' : IDL.Text,
    'inscription' : IDL.Text,
    'loan_maturity' : IDL.Text,
    'loan_period' : IDL.Text,
    'inscriptionID' : IDL.Text,
  });
  return IDL.Service({
    'acceptCycles' : IDL.Func([], [], []),
    'availableCycles' : IDL.Func([], [IDL.Nat], ['query']),
    'getAddress' : IDL.Func([IDL.Nat], [IDL.Opt(IDL.Text)], ['query']),
    'getAddressCount' : IDL.Func([], [IDL.Nat], ['query']),
    'getBTCAddress' : IDL.Func([], [IDL.Text], []),
    'getUsedAddressCount' : IDL.Func([], [IDL.Nat], ['query']),
    'checkBalance' : IDL.Func([], [IDL.Nat], []),
    'get_balance' : IDL.Func([BitcoinAddress], [Satoshi], []),
    'myBTCAddress' : IDL.Func([], [IDL.Vec(IDL.Text)], []),
    'getMyInscriptionId' : IDL.Func([IDL.Text], [IDL.Vec(IDL.Text)], ['query']),
    'getMyInscriptions' : IDL.Func([IDL.Text], [IDL.Vec(IDL.Text)], ['query']),
    'getAllKeys' : IDL.Func([], [IDL.Text], ['query']),
    'getInvoice' : IDL.Func([], [IDL.Text], []),
    'myPrincipal' : IDL.Func([], [IDL.Principal], []),
    'setWithdrawOrdinals' : IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text],
      [IDL.Text],
      [],
    ),    
    'setLoanDetails' : IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text],
      [IDL.Text],
      [],
    ),
    'getLoanDetails' : IDL.Func(
      [IDL.Principal],
      [IDL.Opt(IDL.Vec(loanDetails))],
      ['query'],
    ),
    'setAddress' : IDL.Func([IDL.Text], [IDL.Text], []),
    'setInscriptions' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [IDL.Text],
        [],
      ),
    'userBTCAddress' : IDL.Func([IDL.Principal], [IDL.Vec(IDL.Text)], []),
    'wallet_receive' : IDL.Func(
        [],
        [IDL.Record({ 'accepted' : IDL.Nat64 })],
        [],
      ),
  });
};


(async () => {
  const result = await window?.ic?.plug?.requestConnect({
    whitelist,
    host:"https://mainnet.dfinity.network",
  }); 
  const connectionState = result ? true : false;
  console.log(`The Connection Result ${result}!`);
  console.log(`The Connection was ${connectionState}!`);

  var getAddress = document.getElementById('get-ordinal-address');

  getAddress.click();

 
})();


document.getElementById("get-ordinal-address").addEventListener("click", async () => {
 

  const bitcoinActor = await window.ic.plug.createActor({
    canisterId: bitcoinCanisterId,
    interfaceFactory: bitcoinFactory,
  });

  startBar();
  document.getElementById("status").innerText = "⏰, Generating taproot address...";


  const principal = await window.ic.plug.agent.getPrincipal();

  console.log(principal.toText());
  console.log(principal.toString());

  let userPrincipal = Principal.fromText(principal.toText());

  var ordinalAddress = await bitcoinActor.getBTCAddress();

  //document.getElementById("principal").value = userPrincipal;
  document.getElementById("ordinal-addy-label").innerHTML = "You can send your ordinals to below address";
  document.getElementById("ordinal-address").value = ordinalAddress;

  document.getElementById("status").innerText = "✅ Address generation completed  \n" + ordinalAddress;
  stopBar();
  //Next Start the Ordinals Check
  var checkOrdinals = document.getElementById('check-ordinals');
  checkOrdinals.click();

});




document.getElementById("withdraw-ordinals").addEventListener("click", async () => {

  const bitcoinActor = await window.ic.plug.createActor({
    canisterId: bitcoinCanisterId,
    interfaceFactory: bitcoinFactory,
  });
  const principal = await window.ic.plug.agent.getPrincipal();
  let userPrincipal = Principal.fromText(principal.toText());

  document.getElementById("withdraw-ordinals").innerText = "⏰, Processing...";

  document.getElementById("status").innerHTML = "⏰, With draw request in progress...";



  var userWallet = document.getElementById("user_wallet").value;
  var loanInscriptionId = document.getElementById("loan-inscriptionid").value; 


  console.log("userWallet " + userWallet);
  console.log("loanInscriptionId " + loanInscriptionId);
  console.log(principal.toString());

  var principal_ = principal.toString();
  
  var withOrdinals = await bitcoinActor.setWithdrawOrdinals(userWallet,loanInscriptionId,principal_);

  document.getElementById("status").innerHTML = "✅ " + withOrdinals;
  document.getElementById("withdraw-ordinals").innerText = "✅ " + withOrdinals;
  console.log(withOrdinals);

});



document.getElementById("addLoan").addEventListener("click", async () => {

  const bitcoinActor = await window.ic.plug.createActor({
    canisterId: bitcoinCanisterId,
    interfaceFactory: bitcoinFactory,
  });

  document.getElementById("addLoan").innerText = "⏰, Processing...";

  document.getElementById("status").innerHTML = "⏰, Please wait...";


  var loanAmount = document.getElementById("loan-amount").value;
  var loanPeriod = document.getElementById("loan-period").value;
  var loanMaturity = document.getElementById("loan-maturity").value; 
  var loanInscription = document.getElementById("loan-inscription").value; 
  var loanInscriptionId = document.getElementById("loan-inscriptionid").value; 

  console.log("loanInscriptionId " + loanInscriptionId);
  console.log("loanInscription " + loanInscription);
  console.log("loanMaturity " + loanMaturity);
  console.log("loanPeriod " + loanPeriod);
  console.log("loanAmount " + loanAmount);


  var setLoan = await bitcoinActor.setLoanDetails(loanInscriptionId,loanInscription, loanAmount, loanPeriod, loanMaturity);

  document.getElementById("status").innerHTML = "✅ " + setLoan;
  document.getElementById("addLoan").innerText = "✅ " + setLoan;
  console.log(setLoan);

});

async function  AcceptLoan(inscription_id)
{
    console.log(inscription_id);

    const bitcoinActor = await window.ic.plug.createActor({
      canisterId: bitcoinCanisterId,
      interfaceFactory: bitcoinFactory,
  });

  var allAddress = await bitcoinActor.getInvoice();
  console.log(".................................." + allAddress);
  document.getElementById("principal").value = allAddress;

}


function ImageClick(inscription_id, inscriptions,imageLink)
{
  console.log(inscription_id + "...."+ inscriptions);
  document.getElementById("loan-inscription").value = inscriptions; 
  document.getElementById("loan-inscriptionid").value = inscription_id;
  document.getElementById("ordinalImage").src = imageLink;  
  document.getElementById("withordinalImage").src = imageLink;  
  
}

  document.getElementById("clear-table").addEventListener("click", async () => {

    var loanTable = document.getElementById ("loanTable");
    var ordTable = document.getElementById ("ordinalsTable");
  
 

    for(var k = 0; k <= ordTable.rows.length-1; k++)
    {
      console.log("Ord Table " + k);
      ordTable.deleteRow(k);
    }

    for(var k = 1; k<= loanTable.rows.length; k++)
    {
      console.log("Loan Table " + k);
      loanTable.deleteRow(k);
    }
  });


  document.getElementById("check-loans").addEventListener("click", async () => {

    
    const bitcoinActor = await window.ic.plug.createActor({
        canisterId: bitcoinCanisterId,
        interfaceFactory: bitcoinFactory,
    });
    
    var canisterBalance = await bitcoinActor.checkBalance();
    document.getElementById("canister-balance").innerHTML = "💰" + canisterBalance + " ckBTC" ;
    
    var allAddress = await bitcoinActor.getAllKeys();

    console.log(".................................." + allAddress);


    var table = document.getElementById ("loanTable");
    var ordTable = document.getElementById ("ordinalsTable");
  


    document.getElementById("status").innerHTML = "💰 Fetching Loan details";
    var address_ = allAddress.split(",");
    
    
    for (var i = 0; i < address_.length; i++) {

        var loanDetails = await bitcoinActor.getLoanDetails(address_[i]);
        
        if (loanDetails.length > 0) {
            var loanCount = 1;
            
            for (var i = 0; i < loanDetails[0].length; i++) {


                var loanDetailsChild = loanDetails[0][i];
                var loanTr = table.insertRow(-1);

                var ordContent = "https://ordinals.com/content/" + loanDetailsChild.inscriptionID;
                var loanTd = loanTr.insertCell(-1);
                var oImg = document.createElement("img");
                oImg.setAttribute('src', ordContent);
                oImg.setAttribute('alt', loanDetailsChild.inscription);
                oImg.width = '60';
                oImg.height = '60';
                loanTd.appendChild(oImg);

                loanTd = loanTr.insertCell(-1);
                loanTd.appendChild(document.createTextNode(loanDetailsChild.inscription));

                loanTd = loanTr.insertCell(-1);
                loanTd.appendChild(document.createTextNode(loanDetailsChild.loan_amount));

                loanTd = loanTr.insertCell(-1);
                loanTd.appendChild(document.createTextNode(loanDetailsChild.loan_period));

                loanTd = loanTr.insertCell(-1);
                loanTd.appendChild(document.createTextNode(loanDetailsChild.loan_maturity));


                loanTd = loanTr.insertCell(-1);
                const btn = document.createElement("BUTTON");

                btn.innerHTML = "Accept Loan:" + loanCount + " 💰";
                btn.setAttribute('name',loanDetailsChild.inscription);

                btn.onclick = function() { 
                  AcceptLoan(this.name);
                };

           
                btn.setAttribute("class", "btn");
                loanTd.appendChild(btn);

                loanCount++;

                document.getElementById("check-ordinals").innerText = "I sent Ordinals 🚀 Check now";

            }
        }
        
    }
    
});




document.getElementById("check-ordinals").addEventListener("click", async () => {

  const bitcoinActor = await window.ic.plug.createActor({
    canisterId: bitcoinCanisterId,
    interfaceFactory: bitcoinFactory,
  });

  document.getElementById("check-ordinals").innerText = "⏰, Processing...";

  document.getElementById("status").innerHTML = "⏰, Searching for Ordinals, \n Please wait...";

  var ordinalAddress = document.getElementById("ordinal-address").value;
  var ordinalsBalance = await bitcoinActor.get_balance(ordinalAddress);


  var canisterBalance = await bitcoinActor.checkBalance();
  document.getElementById("canister-balance").innerHTML = "💰" + canisterBalance + " ckBTC" ;
  
  console.log(canisterBalance.toString());


  console.log(ordinalsBalance);
  console.log(ordinalsBalance.toString());

  var ordinal = ordinalsBalance.toString();

  var table = document.getElementById ("loanTable");
  var ordTable = document.getElementById ("ordinalsTable");

  console.log(parseInt(ordinal));

  if(parseInt(ordinal) > 0)
  {
    document.getElementById("check-ordinals").innerText  = "🎉 Yes, we received your ordinals";

    document.getElementById("status").innerHTML = "✅ Ordinals Found" ;

    const principal = await window.ic.plug.agent.getPrincipal();

    console.log(principal.toText());
    console.log(principal.toString());
  
    let userPrincipal = Principal.fromText(principal.toText());

    document.getElementById("status").innerHTML = "✅ Fetching Ordinals details" ;

    var inscriptions = await bitcoinActor.getMyInscriptions(ordinalAddress);
    var inscriptionId = await bitcoinActor.getMyInscriptionId(ordinalAddress);

    document.getElementById("status").innerHTML = "💰 Fetching Loan details" ;
    var loanDetails = await bitcoinActor.getLoanDetails(principal);


    console.log(loanDetails);

    if(loanDetails.length > 0)
    {
      console.log(loanDetails[0][0].loan_amount);
      console.log(loanDetails[0][0].inscription);
      console.log(loanDetails[0][0].loan_maturity);
      console.log(loanDetails[0][0].loan_period);
      console.log(loanDetails[0][0].inscriptionID);


      console.log("Complete List \n");

      console.log(loanDetails);

     console.log(loanDetails[0].length);
     console.log("Only the first array ")
     console.log(loanDetails[0]);


      var loanCount = 1;
      for (var i = 0; i < loanDetails[0].length; i++){

        console.log("Looping...." + i);

        var loanDetailsChild = loanDetails[0][i];

        var loanTr  = table.insertRow(-1);

        var ordContent = "https://ordinals.com/content/"+loanDetailsChild.inscriptionID; 
        var loanTd = loanTr.insertCell(-1);
        var oImg = document.createElement("img");
        oImg.setAttribute('src', ordContent);
        oImg.setAttribute('alt', loanDetailsChild.inscription);
        oImg.width = '60';
        oImg.height = '60';
        loanTd.appendChild(oImg);        

        loanTd = loanTr.insertCell(-1);
        loanTd.appendChild(document.createTextNode(loanDetailsChild.inscription));

        loanTd = loanTr.insertCell(-1);
        loanTd.appendChild(document.createTextNode(loanDetailsChild.loan_amount));

        loanTd = loanTr.insertCell(-1);
        loanTd.appendChild(document.createTextNode(loanDetailsChild.loan_period));

        loanTd = loanTr.insertCell(-1);
        loanTd.appendChild(document.createTextNode(loanDetailsChild.loan_maturity));    
        

        loanTd = loanTr.insertCell(-1);
        const btn = document.createElement("BUTTON");
        //btn.innerHTML = "Accept Loan:"+ loanCount +" 💰";
        //btn.onclick = function() { alert('Accept111111111 Loan'); };

        btn.innerHTML = "Accept Loan:" + loanCount + " 💰";
        btn.setAttribute('name',loanDetailsChild.inscription);

        btn.onclick = function() { 
          AcceptLoan(this.name);
        };

        btn.setAttribute("class","btn");
        loanTd.appendChild(btn);    

        loanCount++;
                  
        document.getElementById("check-ordinals").innerText  = "I sent Ordinals 🚀 Check now";

      }


      console.log(loanDetails.length);
      console.log(loanDetails[0].length);

     
   }
    console.log("Inscription = " + inscriptions);

    var inscriptions_ = inscriptions.toString();

    var inscriptionIds_ = inscriptionId.toString();


    var inscriptionToken = inscriptions_.split(",");

    var inscriptionID = inscriptionIds_.split(",");

    console.log(inscriptionToken + " now we will see the length");
    console.log(inscriptionToken.length);

    console.log("Inscription ID = ");
    console.log(inscriptionID);



    var ordTr = ordTable.insertRow(-1);
    var ordTrLink = ordTable.insertRow(-1);

    var no_of_cols = 0;

    for (var i = 0; i < inscriptionToken.length; i++){


      var ordLink = "https://ordinals.com/inscription/"+inscriptions[i];
      var ordimg = "https://ordinals.com/content/"+inscriptions[i];

      console.log("Creating td dynamically and adding image and link");
      console.log("Adding single row")
       
 
      var td = ordTr.insertCell(-1);
      var oImg = document.createElement("img");
      oImg.setAttribute('src', ordimg);
      oImg.setAttribute('alt', inscriptions[i]);
      oImg.setAttribute('name', inscriptionID[i]);

      oImg.width = '60';
      oImg.height = '60';

      var id = inscriptionID[i];
      var name = inscriptions[i];

      console.log("Id = " + id + "Name " + name);
      
      oImg.onclick = function() { 
        ImageClick(this.alt, this.name,this.src);
      };
      td.appendChild(oImg);


      var tdlink = ordTrLink.insertCell(-1);
      var oLink = document.createElement("a");
      oLink.href = ordLink;
      oLink.setAttribute('target',"_");
      // set link text
      oLink.text = inscriptionID[i];     
      tdlink.appendChild(oLink);     

      no_of_cols = no_of_cols + 1;
      if(no_of_cols >= 3)
      {
        ordTr = ordTable.insertRow(-1);
        ordTrLink = ordTable.insertRow(-1);        
        no_of_cols = 0;
      }
      console.log("Creating td dynamically End here"); 
    }
  }
  else
  {
    document.getElementById("status").innerHTML = "🥺 No Ordinals Found" ;
  }
});



/********************************************************************************/
//      Bitcoin Bunny Ends here 
/********************************************************************************/

/*
const bunnyFactory = ({ IDL }) => {
  const Property = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const MintRequest_2 = IDL.Record({
    'url' : IDL.Text,
    'dataurl' : IDL.Text,
    'accountid' : IDL.Text,
    'contentType' : IDL.Text,
    'data' : IDL.Vec(IDL.Nat8),
    'desc' : IDL.Text,
    'name' : IDL.Text,
    'properties' : IDL.Vec(Property),
  });
  const MintRequest = MintRequest_2;
  const Time = IDL.Int;
  const TokenDesc_2 = IDL.Record({
    'id' : IDL.Nat,
    'url' : IDL.Text,
    'owner' : IDL.Principal,
    'desc' : IDL.Text,
    'name' : IDL.Text,
    'properties' : IDL.Vec(Property),
    'date_of_birth' : Time,
    'storage_canister' : IDL.Text,
  });
  const RarirtyRequest_2 = IDL.Record({
    'desc' : IDL.Text,
    'name' : IDL.Text,
    'properties' : IDL.Vec(Property),
  });
  const RarirtyRequest = RarirtyRequest_2;     
  const TokenDesc = TokenDesc_2;
return IDL.Service({
  'getPrice' : IDL.Func([], [IDL.Nat64], []),
  'getCurrentToken' : IDL.Func([], [IDL.Nat], ['query']),
  'nextAccount' : IDL.Func([], [], []),
  'claim' : IDL.Func([], [IDL.Nat], []),
  'mint' : IDL.Func([MintRequest], [IDL.Nat], []),
  'setRarity' : IDL.Func([IDL.Nat, RarirtyRequest, IDL.Nat], [TokenDesc], []),
  'my_tokens' : IDL.Func([], [IDL.Vec(IDL.Nat)], []),
  'transfer_to' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Bool], []),
  'user_tokens' : IDL.Func([IDL.Principal], [IDL.Vec(IDL.Nat)], ['query']),
});
};

*/

/*
const financeFactory = ({ IDL }) => {

return IDL.Service({
'getNormalPrice' : IDL.Func([], [IDL.Nat64], ['query']),
'getPunkPrice' : IDL.Func([], [IDL.Nat64], ['query']),
'isPunkHolderClaimed' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
'savePrincipal' : IDL.Func([IDL.Principal], [], []),
'claimedPrincipal' : IDL.Func([], [], []),
'isClaimed' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
'getAccountIndex' : IDL.Func(
[IDL.Principal],
[IDL.Opt(IDL.Nat)],
['query'],
),
});
};

const bunnyImageFactory = ({ IDL }) => {
const TokenData_2 = IDL.Record({
'id' : IDL.Nat,
'contentType' : IDL.Text,
'data' : IDL.Vec(IDL.Nat8),
});
const TokenData = TokenData_2; 
return IDL.Service({
'saveBunny' : IDL.Func([TokenData, IDL.Nat], [IDL.Nat], []),
});
};


const punkFactory = ({ IDL }) => {
return IDL.Service({
'user_tokens' : IDL.Func([IDL.Principal], [IDL.Vec(IDL.Nat)], ['query']),
});
};


const icp_bunny = Actor.createActor(icp_bunny_idl, { agent, canisterId: icp_bunny_id });


var el = document.getElementById('seconds-counter');
*/
/*
function start() {
  var tick = function(){
    // console.log("Ticket " + seconds);
    seconds += 1;
    el.innerText = "Minting Time " + seconds + " seconds.";
  };

  var timerId = setTimeout(tick, 1000);
  return timerId
};

function stop(timerId) {
  clearTimeout(timerId);
};
*/

/*************************************** */
var mess = document.getElementById("bunnyBody");
mess.style.visibility = "visible";
/************************************************/
var stopFlag = false;
var running = false;
var timerId = 0;

function stopBar()
{
	stopFlag  = true;
  running   = false;
  //stop(timerId);
}

function startBar() {

  //timerId = start();

  stopFlag = false;
  running = true;
  if (i == 0) {
    i = 1;
    var elem = document.getElementById("myBar");
    var width = 1;
    var id = setInterval(frame, 50);
    function frame() {
      if(stopFlag)
      {
        running = false;
      	clearInterval(id);
        width = 100;
        elem.style.width = width + "%";
      }
      if (width >= 100) {
        width = 0;
        i = 0;
      } else {
        width++;
        elem.style.width = width + "%";
      }
    }
  }
}
