interface messageData{
    id:number;
    username:string;
    content:string;
    like:number;
    created:string;
    updated:string;


}

interface messagesData{
    data:messageData[];
    total:number;
}
const divcontent:HTMLTextAreaElement=document.getElementById("message") as HTMLTextAreaElement;
const divusername:HTMLInputElement=document.getElementById("username") as HTMLInputElement;
const container:HTMLUListElement = document.getElementById("commentsList") as HTMLUListElement
let submit:HTMLButtonElement= document.getElementById("submit") as HTMLButtonElement;

async function displaymessageAPI():Promise<void> {
    const data:messagesData=await getmessageAPI();
    if (data != undefined) {
        for (let i = 0; i <=20; i++) {
            const newmessage:HTMLDivElement= createmessage(data.data[i].username,data.data[i].content,data.data[i].created)
            container.appendChild(newmessage);


            
        }
    }
}
function createmessage(name:string,body:string,timestamp:string):HTMLDivElement {
    const message:HTMLDivElement = document.createElement("div");
    const namep:HTMLParagraphElement = document.createElement("p");
    const timestampspan:HTMLSpanElement = document.createElement("span");
    const bodyp:HTMLParagraphElement = document.createElement("p");

    message.classList.add("message");
    namep.textContent = name;
    namep.classList.add("msg-name");
    timestampspan.textContent = timestamp
    timestampspan.classList.add("msg-date");
    bodyp.classList.add("msg-body");
    bodyp.textContent= body;

    namep.appendChild(timestampspan);
    message.appendChild(namep);
    message.appendChild(bodyp);
    
    return message;

}

async function getmessageAPI():Promise<messagesData> {
    const res:Response= await fetch(process.env.API_URL+"messages")
    if (res.ok) {
        const data:messagesData= await res.json();

        return data;
    }
    else {
        console.log("Error : "+res.status);
        throw new Error("aie");
         
    }
}

async function sendmessageAPI() {
    let content:string = divcontent.value;
    let username:string = divusername.value;
    const comment:Response = await fetch(process.env.API_URL+"message",{        
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify({

            username: username,
            content: content,
            
        })
        
    })
    console.log("aled");  
}

function formattedtime(date:Date) {
    const months:string[]= ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const year:number = date.getFullYear();
    const month:string = months[date.getMonth()];
    const day:number = date.getDate();
    const hour:number = date.getHours();
    const min:number = date.getMinutes();
    const sec:number = date.getSeconds();
    const formattedtime:string = day + " " + month + " " + year + " " + hour + "h "+ min + "min " + sec + "sec";

    return formattedtime;
}


submit.addEventListener("click",async (e:Event)=>{
    e.preventDefault();
    sendmessageAPI();
});

displaymessageAPI();