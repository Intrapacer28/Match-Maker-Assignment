const promise = new Promise((resolve,reject) =>{

    const isBoarded = false;
    if(isBoarded){
        resolve("On my way")
    }
    else{
        reject("My passport lost")
    }

})

promise.then((data) => console.log("I got the data", data))
.catch((data) => console.log("I got rejected",data))
.finally(() => console.log("I will always get executed"))


//Promise.all --> will make parallel api calls/run promises in parallel and return an array of results of promises if every promise resolves
//if any promise gets rejected it will throw an error

const promise1 = new Promise((resolve,reject) =>{
    setTimeout(()=>{
        resolve("this is insane 1")
    }, 5000)
})

const promise2 = new Promise((resolve,reject) =>{
    setTimeout(()=>{
        resolve("this is insane 2")
    }, 5000)
})

const promise3 = new Promise((resolve,reject) =>{
    setTimeout(()=>{
        resolve("this is insane 3")
    }, 5000)
})

Promise.all([promise1, promise2, promise3]).then((data) => {
    console.log("Done", data)
}).catch((error) => {
    console.log("some error occured")
})