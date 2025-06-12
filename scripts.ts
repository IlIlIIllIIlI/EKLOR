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

interface pfpdata{
    avatar:URL
}

interface messagesData{
    data:messageData[];
    total:number;
}


const bodyElement:HTMLBodyElement=document.getElementById("body") as HTMLBodyElement;
const divcontent:HTMLTextAreaElement=document.getElementById("message") as HTMLTextAreaElement;
const divusername:HTMLInputElement=document.getElementById("username") as HTMLInputElement;
const container:HTMLUListElement = document.getElementById("messages-list") as HTMLUListElement
const submit:HTMLButtonElement= document.getElementById("submit") as HTMLButtonElement;
const loadMore:HTMLButtonElement= document.getElementById("loadmore") as HTMLButtonElement;

let pageLoaded:number=1;
let lock:boolean=false;
async function displaymessageAPI():Promise<void> {
    if (lock) {
        return
    }

    lock=true;

    const data:messagesData=await getMessageAPI(pageLoaded);

    if (data != undefined) {
        for (let i = 0; i <29; i++) {
            if (data.data[i]=== undefined) {
                const end:HTMLDivElement=document.createElement("div");
                end.textContent="C'est tout"
                bodyElement.appendChild(end);
                loadMore.hidden=true;
                return;
            } else {
                const comments:messagesData= await getCommentAPI(data.data[i].id)
                const pfp:pfpdata= await getPfpAPI(data.data[i].username)
                const newmessage:HTMLDivElement= createmessage(data.data[i].id,pfp.avatar,data.data[i].username,data.data[i].content,data.data[i].created_at,data.data[i].like,comments.total)
                container.appendChild(newmessage);

            }
           

            
            
        }
    }
    pageLoaded++
    lock =false
}

function createmessage(id:number, pfp:URL,name:string,body:string,timestamp:string,like:number,commentCount:number):HTMLDivElement {
    const message:HTMLDivElement = document.createElement("div");
    const namep:HTMLParagraphElement = document.createElement("p");
    const timestampspan:HTMLSpanElement = document.createElement("span");
    const bodyp:HTMLParagraphElement = document.createElement("p");
    const likespan:HTMLSpanElement = document.createElement("span"); 
    const metadiv:HTMLDivElement=document.createElement("div"); 
    const commentspan:HTMLSpanElement= document.createElement("span");
    const pfppic:HTMLImageElement=document.createElement("img");
    
    message.dataset.id=String(id);
    message.classList.add("message");
    namep.textContent = name;
    namep.classList.add("msg-name");
    timestampspan.textContent = format_date(timestamp)
    timestampspan.classList.add("msg-date");
    bodyp.classList.add("msg-body");
    bodyp.textContent= body;
    likespan.classList.add("msg-likes")
    likespan.textContent="🖤   "+ String(like)
    metadiv.classList.add("msg-meta")
    commentspan.textContent="💬   "+ String(commentCount)
    commentspan.classList.add("message-com")
    pfppic.src=String(pfp);
    pfppic.classList.add("img")

    
    metadiv.appendChild(likespan);
    metadiv.appendChild(commentspan);
    metadiv.appendChild(timestampspan);
    message.appendChild(pfppic);
    message.appendChild(namep);
    message.appendChild(bodyp);
    message.appendChild(metadiv)
    
    return message;

}

async function getMessageAPI(page:number):Promise<messagesData> {
    const params:URLSearchParams=new URLSearchParams()
    params.append("page",String(page))
    const res:Response= await fetch(`${API_URL}messages?${params}`)
    if (res.ok) {
        const data:messagesData= await res.json();   
        return data;

        
    }
    else {
        console.log("Error : "+res.status);
        throw new Error("oops");
         
    }
}

async function sendMessageAPI() {
    let content:string = divcontent.value;
    let username:string = divusername.value;
    const message:Response = await fetch(API_URL+"message",{        
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

async function getCommentAPI(id:number):Promise<messagesData> {
    const params:URLSearchParams=new URLSearchParams()
    params.append("message_id",String(id))
    const res:Response= await fetch(`${API_URL}comments?${params}`)
     if (res.ok) {
        const data:messagesData= await res.json();   
        return data;

        
    }
    else {
        console.log("Error : "+res.status);
        throw new Error("oops");
         
    }


}

async function addCommentAPI(id:number,username:string,content:string) {
     const message:Response = await fetch(API_URL+"comment",{        
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify({

            message_id:id,
            username: username,
            content: content,
            
        })
        
    })
}

async function getPfpAPI(username:string):Promise<pfpdata> {
    const params:URLSearchParams=new URLSearchParams()
    params.append("username",username)
    const res:Response= await fetch(`${API_URL}avatar?${params}`)
    if (res.ok) {
        const data:pfpdata= await res.json();   
        return data;

        
    }
    else {
        console.log("Error : "+res.status);
        throw new Error("oops");
         
    }
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

async function likeMessageApi(messageId:number) {
    const like:Response = await fetch(API_URL+"message/like",{        
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify({

            message_id:messageId
            
        })
        
    })
}

function replace(expr:string,to_replace:string,replace_with:string):string{
    let res:string="";
    let replace:string="";   
    let counter:number=0;

    for (let i=0; i<expr.length; i++) {
        
        replace=replace+expr[i];
        
        counter++;

        if (counter===to_replace.length) {
                if (replace===to_replace) {
                
                        res=res+replace_with;
                        
                        replace="";
                        counter=0;

                        
                }  else {
                    res=res+replace[0];

                    let newreplace:string="";

                    for (let j= 1; j <replace.length; j++) {
                        newreplace=newreplace+replace[j];
                        
                    }
                    replace=newreplace;
                    counter=replace.length;
                        

                }

                
        }


    }

    res=res+replace;

    return res;
    
}

function updateLike(like:string):string {
    let res:string = replace(like,"🖤","❤️")
    let resoldnum:string="";
    let resnum:number=0;
    for (let i = 0; i < res.length; i++) {
        if (!isNaN(Number(res[i]))&&res[i]!=" ") {
            resoldnum+=res[i]
            console.log(resoldnum);
            
        }
        
    }

    resnum=Number(resoldnum)

    resnum++
    
    return replace(res,resoldnum,String(resnum))
}



submit.addEventListener("click",async (e:Event)=>{
    e.preventDefault();
    sendMessageAPI();
});


container.addEventListener("click",async (e:Event)=>{
    const target:HTMLUListElement =e.target as HTMLUListElement
    const likeElement:HTMLButtonElement = target.closest(".msg-likes") as HTMLButtonElement
    if (likeElement ===undefined) {
     console.log("oops");
     
    }else{
        const messageElement:HTMLDivElement= target.closest(".message") as HTMLDivElement;
        likeElement.classList.remove("msg-likes")
        likeElement.classList.add("msg-likes-clicked")
        likeMessageApi(Number(messageElement.dataset.id))
        likeElement.textContent=updateLike(String(likeElement.textContent))

    }
})


loadMore.addEventListener("click", async (e:Event)=>{
    displaymessageAPI()
})







displaymessageAPI();