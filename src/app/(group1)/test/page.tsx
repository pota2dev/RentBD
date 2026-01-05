// import { title } from "process";

export const metadata = {
    title: "Hello"
}


export default async function Test({searchParams}: any) {
    const {id} = await searchParams;
    console.log(id)
    console.log("Hello!!!!!!!!!!!!")
    return <span>Hello World {id}</span>
}