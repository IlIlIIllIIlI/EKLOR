import { config } from "./env.js";

const API_URL = config.API_URL;

interface messageData{
    id:number;
    username:string;
    content:string;
    like:number;
    created_at:string;
    updated_at:string;


}

interface messagesData{
    data:messageData[];
    total:number;
}
const divcontent:HTMLTextAreaElement=document.getElementById("message") as HTMLTextAreaElement;
const divusername:HTMLInputElement=document.getElementById("username") as HTMLInputElement;
const container:HTMLUListElement = document.getElementById("messages-list") as HTMLUListElement
let submit:HTMLButtonElement= document.getElementById("submit") as HTMLButtonElement;

async function displaymessageAPI():Promise<void> {
    const data:messagesData=await getmessageAPI();
    if (data != undefined) {
        for (let i = 0; i <=20; i++) {
            const newmessage:HTMLDivElement= createmessage(data.data[i].username,data.data[i].content,data.data[i].created_at,data.data[i].like)
            container.appendChild(newmessage);

            
            
        }
    }
}
function createmessage(name:string,body:string,timestamp:string,like:number):HTMLDivElement {
    const message:HTMLDivElement = document.createElement("div");
    const namep:HTMLParagraphElement = document.createElement("p");
    const timestampspan:HTMLSpanElement = document.createElement("span");
    const bodyp:HTMLParagraphElement = document.createElement("p");
    const likespan:HTMLSpanElement = document.createElement("span"); 
    const metadiv:HTMLDivElement=document.createElement("div"); 
    

    message.classList.add("message");
    namep.textContent = name;
    namep.classList.add("msg-name");
    timestampspan.textContent = format_date(timestamp)
    timestampspan.classList.add("msg-date");
    bodyp.classList.add("msg-body");
    bodyp.textContent= body;
    likespan.classList.add("msg-likes")
    likespan.textContent="❤️   "+ String(like)
    metadiv.classList.add("msg-meta")
    metadiv.appendChild(likespan);
    metadiv.appendChild(timestampspan);
    message.appendChild(namep);
    message.appendChild(bodyp);
    message.appendChild(metadiv)
    
    return message;

}

async function getmessageAPI():Promise<messagesData> {
    const res:Response= await fetch(API_URL+"messages")
    if (res.ok) {
        const data:messagesData= await res.json();

        return data;
    }
    else {
        console.log("Error : "+res.status);
        throw new Error("oops");
         
    }
}

async function sendmessageAPI() {
    let content:string = divcontent.value;
    let username:string = divusername.value;
    const comment:Response = await fetch(API_URL+"message",{        
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify({

            username: username,
            content: content,
            
        })
        
    })
}

function pad(word:string,pad_size:number):string{
    if(word.length>pad_size){
        return word;
    }
    else{
        let res : string = "";
        for (let i = 0; i < pad_size-word.length; i++) {
            res+="0";
        }
        res+=word;
        return res;
    }
}

function format_date(timestamp:string):string{

    const date : Date = new Date(timestamp);
    let formatted_date_time : string;
    
    let hours: number = date.getHours();
    const minutes: number = date.getMinutes();
    
    if(hours<1){
        formatted_date_time = `${minutes} ago`;
    }
    else{

        const formattedTime: string = `${hours}:${pad(String(minutes),2)}`;
        
        const day: number = date.getDate();
        const month: number = date.getMonth() + 1;
        const year: number = date.getFullYear();
        const formattedDate: string = `${pad(String(day),2)}/${pad(String(month),2)}/${year}`;

        formatted_date_time = `${formattedDate} at ${formattedTime}`;
    }

    return formatted_date_time;
}

submit.addEventListener("click",async (e:Event)=>{
    e.preventDefault();
    sendmessageAPI();
});

displaymessageAPI();