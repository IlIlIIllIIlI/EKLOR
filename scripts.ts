import { config } from "./env.js";

const API_URL = config.API_URL;

interface messageData {
    id: number;
    username: string;
    content: string;
    like: number;
    created_at: string;
    updated_at: string;
}

interface pfpdata {
    avatar: URL;
}

interface messagesData {
    data: messageData[];
    total: number;
}

const bodyElement: HTMLBodyElement = document.getElementById(
    "body"
) as HTMLBodyElement;
const divcontent: HTMLTextAreaElement = document.getElementById(
    "message"
) as HTMLTextAreaElement;
const divusername: HTMLInputElement = document.getElementById(
    "username"
) as HTMLInputElement;
const container: HTMLUListElement = document.getElementById(
    "messages-list"
) as HTMLUListElement;
const submit: HTMLButtonElement = document.getElementById(
    "submit"
) as HTMLButtonElement;
const loadMore: HTMLButtonElement = document.getElementById(
    "loadmore"
) as HTMLButtonElement;
const goBack: HTMLDivElement = document.getElementById(
    "back-button"
) as HTMLDivElement;
const messageDetail: HTMLDivElement = document.getElementById(
    "message-detail"
) as HTMLDivElement;
const comments: HTMLDivElement = document.getElementById(
    "comments-container"
) as HTMLDivElement;
const commentForm: HTMLFormElement = document.getElementById(
    "comment-form"
) as HTMLFormElement;
const commentContent: HTMLTextAreaElement = document.getElementById(
    "comment-content"
) as HTMLTextAreaElement;
const commentUsername: HTMLInputElement = document.getElementById(
    "comment-username"
) as HTMLInputElement;
const submitCom: HTMLButtonElement = document.getElementById(
    "submit-com"
) as HTMLButtonElement;
const mainFeed: HTMLDivElement = document.getElementById(
    "main-feed"
) as HTMLDivElement;
const messageDetailView = document.getElementById(
    "message-detail-view"
) as HTMLDivElement;
const messageForm:HTMLFormElement=document.getElementById(
    "message-form"
) as HTMLFormElement;

let pageLoaded: number = 1;
let lock: boolean = false;
let currentMainMessageId: number | null = null;
async function displaymessageAPI(): Promise<void> {
    if (lock) {
        return;
    }

    lock = true;

    const data: messagesData = await getMessageAPI(pageLoaded);

    if (data != undefined) {
        for (let i = 0; i < data.data.length; i++) {
            if (data.data[i] === undefined) {
                const end: HTMLDivElement = document.createElement("div");
                end.textContent = "C'est tout";
                bodyElement.appendChild(end);
                loadMore.hidden = true;
                return;
            } else {
                const comments: messagesData = await getCommentsAPI(data.data[i].id, 1);
                const pfp: pfpdata = await getPfpAPI(data.data[i].username);
                const newmessage: HTMLDivElement = createmessage(
                    data.data[i].id,
                    pfp.avatar,
                    data.data[i].username,
                    data.data[i].content,
                    data.data[i].created_at,
                    data.data[i].like,
                    comments.total
                );
                container.appendChild(newmessage);
            }
        }
    }
    pageLoaded++;
    lock = false;
}

async function displayCommentsAPI(id: number, total: number) {
    comments.innerHTML = "";

    for (let i = 1; i <= total; i++) {
        const data: messagesData = await getCommentsAPI(id, i);

        if (data != undefined) {
            for (let j = 0; j < data.data.length; j++) {
                if (data.data[j] === undefined) {
                    const end: HTMLDivElement = document.createElement("div");
                    end.textContent = "C'est tout";
                    bodyElement.appendChild(end);
                    return;
                } else {
                    const newcomment: HTMLDivElement = createComment(
                        data.data[j].id,
                        data.data[j].username,
                        data.data[j].content,
                        data.data[j].created_at
                    );
                    comments.appendChild(newcomment);
                }
            }
        }
    }
}

function createmessage(
    id: number,
    pfp: URL,
    name: string,
    body: string,
    timestamp: string,
    like: number,
    commentCount: number
): HTMLDivElement {
    const message: HTMLDivElement = document.createElement("div");
    const namep: HTMLParagraphElement = document.createElement("p");
    const timestampSpan: HTMLSpanElement = document.createElement("span");
    const bodyp: HTMLParagraphElement = document.createElement("p");
    const likeSpan: HTMLSpanElement = document.createElement("span");
    const metaDiv: HTMLDivElement = document.createElement("div");
    const commentSpan: HTMLSpanElement = document.createElement("span");
    const pfpPic: HTMLImageElement = document.createElement("img");
    const interactionsDiv: HTMLDivElement = document.createElement("div"); 

    message.dataset.id = String(id);
    message.classList.add("message");
    namep.textContent = name;
    namep.classList.add("msg-name");
    timestampSpan.textContent = format_date(timestamp);
    timestampSpan.classList.add("msg-date");
    bodyp.classList.add("msg-body");
    bodyp.textContent = body;
    likeSpan.classList.add("msg-likes");
    likeSpan.textContent = "🖤   " + String(like);
    metaDiv.classList.add("msg-meta");
    commentSpan.textContent = "💬   " + String(commentCount);
    commentSpan.classList.add("msg-com");
    pfpPic.src = String(pfp);
    pfpPic.classList.add("img");
    interactionsDiv.classList.add("msg-interactions");

    interactionsDiv.appendChild(likeSpan);
    interactionsDiv.appendChild(commentSpan)
    metaDiv.appendChild(interactionsDiv)
    metaDiv.appendChild(timestampSpan);
    message.appendChild(pfpPic);
    message.appendChild(namep);
    message.appendChild(bodyp);
    message.appendChild(metaDiv);

    return message;
}

function createComment(
    id: number,
    name: string,
    body: string,
    timestamp: string
): HTMLDivElement {
    const comment: HTMLDivElement = document.createElement("div");
    const namep: HTMLParagraphElement = document.createElement("p");
    const timestampspan: HTMLSpanElement = document.createElement("span");
    const bodyp: HTMLParagraphElement = document.createElement("p");
    const metadiv: HTMLDivElement = document.createElement("div");

    comment.dataset.id = String(id);
    comment.classList.add("message");
    namep.textContent = name;
    namep.classList.add("msg-name");
    timestampspan.textContent = format_date(timestamp);
    timestampspan.classList.add("msg-date");
    bodyp.classList.add("msg-body");
    bodyp.textContent = body;
    metadiv.classList.add("msg-meta");

    metadiv.appendChild(timestampspan);
    comment.appendChild(namep);
    comment.appendChild(bodyp);
    comment.appendChild(metadiv);

    return comment;
}

async function getMessageAPI(page: number): Promise<messagesData> {
    const params: URLSearchParams = new URLSearchParams();
    params.append("page", String(page));
    const res: Response = await fetch(`${API_URL}messages?${params}`);
    if (res.ok) {
        const data: messagesData = await res.json();
        return data;
    } else {
        console.log("Error : " + res.status);
        throw new Error("oops");
    }
}

async function sendMessageAPI(content: string, username: string) {
    const message: Response = await fetch(API_URL + "message", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            content: content,
        }),
    });
}

async function getCommentsAPI(id: number, page: number): Promise<messagesData> {
    const params: URLSearchParams = new URLSearchParams();
    params.append("message_id", String(id));
    params.append("page", String(page));
    const res: Response = await fetch(`${API_URL}comments?${params}`);
    if (res.ok) {
        const data: messagesData = await res.json();
        return data;
    } else {
        console.log("Error : " + res.status);
        throw new Error("oops");
    }
}

async function addCommentAPI(id: number, username: string, content: string) {
    const message: Response = await fetch(API_URL + "comment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message_id: id,
            username: username,
            content: content,
        }),
    });
}

async function getPfpAPI(username: string): Promise<pfpdata> {
    const params: URLSearchParams = new URLSearchParams();
    params.append("username", username);
    const res: Response = await fetch(`${API_URL}avatar?${params}`);
    if (res.ok) {
        const data: pfpdata = await res.json();
        return data;
    } else {
        console.log("Error : " + res.status);
        throw new Error("oops");
    }
}

function pad(word: string, pad_size: number): string {
    if (word.length > pad_size) {
        return word;
    } else {
        let res: string = "";
        for (let i = 0; i < pad_size - word.length; i++) {
            res += "0";
        }
        res += word;
        return res;
    }
}

function format_date(timestamp: string): string {
    const date: Date = new Date(timestamp);
    let formatted_date_time: string;

    let hours: number = date.getHours();
    const minutes: number = date.getMinutes();

    if (hours < 1) {
        formatted_date_time = `${minutes} min ago`;
    } else {
        const formattedTime: string = `${hours}:${pad(String(minutes), 2)}`;

        const day: number = date.getDate();
        const month: number = date.getMonth() + 1;
        const year: number = date.getFullYear();
        const formattedDate: string = `${pad(String(day), 2)}/${pad(
            String(month),
            2
        )}/${year}`;

        formatted_date_time = `${formattedDate} at ${formattedTime}`;
    }

    return formatted_date_time;
}

async function likeMessageApi(messageId: number) {
    const like: Response = await fetch(API_URL + "message/like", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message_id: messageId,
        }),
    });
}

function replace(
    expr: string,
    to_replace: string,
    replace_with: string
): string {
    let res: string = "";
    let replace: string = "";
    let counter: number = 0;

    for (let i = 0; i < expr.length; i++) {
        replace = replace + expr[i];

        counter++;

        if (counter === to_replace.length) {
            if (replace === to_replace) {
                res = res + replace_with;

                replace = "";
                counter = 0;
            } else {
                res = res + replace[0];

                let newreplace: string = "";

                for (let j = 1; j < replace.length; j++) {
                    newreplace = newreplace + replace[j];
                }
                replace = newreplace;
                counter = replace.length;
            }
        }
    }

    res = res + replace;

    return res;
}

function updateLike(like: string): string {
    let res: string = replace(like, "🖤", "❤️");
    let resoldnum: string = "";
    let resnum: number = 0;
    for (let i = 0; i < res.length; i++) {
        if (!isNaN(Number(res[i])) && res[i] != " ") {
            resoldnum += res[i];
            console.log(resoldnum);
        }
    }

    resnum = Number(resoldnum);

    resnum++;

    return replace(res, resoldnum, String(resnum));
}

async function showMessageDetails(messageId: number) {

    container.parentElement!.style.display = "none";
    loadMore.style.display = "none";

    mainFeed.style.display = "none";

    messageForm.style.display="none"
    

    messageDetail.innerHTML = "";
    comments.innerHTML = "";

    messageDetailView.style.display = "block";
    messageDetail.style.display = "block";
    comments.style.display = "block";
    goBack.style.display = "block";
    commentForm.style.display = "block";

    currentMainMessageId = messageId;

    for (let i = 1; i <= pageLoaded; i++) {
        const data: messagesData = await getMessageAPI(i);
        for (let j = 0; j < data.data.length; j++) {
            if (data.data[j] === undefined) {
                console.log("error ???");
                return;
            }

            if (data.data[j].id === messageId) {
                const comments: messagesData = await getCommentsAPI(data.data[j].id, 1);
                const pfp: pfpdata = await getPfpAPI(data.data[j].username);
                const message: HTMLDivElement = createmessage(
                    data.data[j].id,
                    pfp.avatar,
                    data.data[j].username,
                    data.data[j].content,
                    data.data[j].created_at,
                    data.data[j].like,
                    comments.total
                );
                messageDetail.appendChild(message);
                displayCommentsAPI(data.data[j].id, data.total);
                console.log("done");

                return;
            }
        }
    }

    console.log("error ???");
    return;
}

function showMessages() {


    container.parentElement!.style.display = "block";
    loadMore.style.display = "block";

    mainFeed.style.display = "block";
    messageForm.style.display="block";

    messageDetail.innerHTML = "";
    comments.innerHTML = "";

    messageDetailView.style.display = "none";
    messageDetail.style.display = "none";
    comments.style.display = "none";
    goBack.style.display = "none";
    commentForm.style.display = "none";

    currentMainMessageId = null;
}

submit.addEventListener("click", async (e: Event) => {
    e.preventDefault();
    sendMessageAPI(divcontent.value, divusername.value);
    divcontent.value="";
    divusername.value="";
    displaymessageAPI();
});

container.addEventListener("click", async (e: Event) => {
    const target: HTMLUListElement = e.target as HTMLUListElement;
    const message: HTMLDivElement = target.closest(".message") as HTMLDivElement;

    if (target.closest(".msg-likes") != null) {
        const likeElement: HTMLSpanElement = target.closest(
            ".msg-likes"
        ) as HTMLSpanElement;
        likeElement.classList.remove("msg-likes");
        likeElement.classList.add("msg-likes-clicked");
        likeMessageApi(Number(message.dataset.id));
        likeElement.textContent = updateLike(String(likeElement.textContent));
        return;
    }

    if (target.closest(".msg-com") != null) {
        if (!isNaN(Number(message.dataset.id))) {
            await showMessageDetails(Number(message.dataset.id));
        }

        return;
    }

    if (target.closest(".msg-body")) {
        if (!isNaN(Number(message.dataset.id))) {
            await showMessageDetails(Number(message.dataset.id));
        }
    }
});

messageDetail.addEventListener("click", async (e: Event) => {
    const target: HTMLDivElement = e.target as HTMLDivElement;
    const message: HTMLDivElement = target.closest(".message") as HTMLDivElement;

    if (target.closest(".msg-likes") != null) {
        const likeElement: HTMLSpanElement = target.closest(
            ".msg-likes"
        ) as HTMLSpanElement;
        likeElement.classList.remove("msg-likes");
        likeElement.classList.add("msg-likes-clicked");
        likeMessageApi(Number(message.dataset.id));
        likeElement.textContent = updateLike(String(likeElement.textContent));
        return;
    }
});

loadMore.addEventListener("click", async (e: Event) => {
    displaymessageAPI();
});

submitCom.addEventListener("click", async (e: Event) => {
    e.preventDefault();

    if (currentMainMessageId != null) {
        await addCommentAPI(
            currentMainMessageId,
            commentUsername.value,
            commentContent.value
        );
        commentUsername.value = "";
        commentContent.value = "";
        const commentsData = await getCommentsAPI(currentMainMessageId, 1);
        displayCommentsAPI(currentMainMessageId, commentsData.total);
        console.log("done");
    }
});

goBack.addEventListener("click", (e: Event) => {
    showMessages();
});

displaymessageAPI();
