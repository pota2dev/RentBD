// export default function Test2(props: any) {
//     return <h1>{props.children} Mahdi</h1>
// }
export default function Test2({children}: any) {
    // This will print "object", "string", "undefined", etc.
    console.log("The type of params is:", typeof children);
    
    // If you suspect it's a Promise (common in Next.js 15)
    console.log("Is it a Promise?", children instanceof Promise);
    return <h2>{children} Mahdi</h2>
}