/*
 * @Author: 大蒙
 * @Date: 2023-02-24 09:06:53
 * @LastEditors: 大蒙
 * @LastEditTime: 2023-02-27 21:46:49
 * @FilePath: /study/mini_vue/effect5.js
 * @Description: 
 * 
 * Copyright (c) 2023, All Rights Reserved. 
 */
const bucket = new WeakMap()
const data = { foo: 1, bar: true, demo: 1 }
let activeEffect = null
const effectStack = []
const obj = new Proxy(data, {
    get(target, key) {
        track(target, key)
        return target[key]
    },
    set(target, key, value) {
        target[key] = value
        trigger(target, key)
    }
})

const track = (target, key) => {
    if (!activeEffect) return
    let depsMap = bucket.get(target)
    if (!depsMap) {
        depsMap = new Map()
        bucket.set(target, depsMap)
    }
    let deps = depsMap.get(key)
    if (!deps) {
        deps = new Set()
        depsMap.set(key, deps)
    }
    deps.add(activeEffect)
    activeEffect.deps.push(deps) //一个属性对应一个Set集合,一个Set集合对应多个effect
}

const trigger = (target, key) => {
    let depsMap = bucket.get(target) // 获取依赖
    if (!depsMap) return
    let effects = depsMap.get(key)

    const effectsToRun = new Set()

    effects && effects.forEach(effectFn => {
        if (effectFn != activeEffect) { //防止重复执行
            effectsToRun.add(effectFn)
        }
    })
    effectsToRun.forEach(effectFn => {
        if (effectFn.options?.scheduler) { //副作用函数中有scheduler函数 
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
}

const jobQueue = new Set()
const p = Promise.resolve()
let isFlushing = false


//flushJob函数中，首先判断isFlushing是否为true，如果为true，
//说明当前正在刷新队列，直接返回，如果为false，说明当前没有在刷新队列，
//将isFlushing设置为true，然后通过Promise.resolve().then()将任务
//放到下一个tick中执行，最后将isFlushing设置为false
const flushJob = () => {
    if (isFlushing) return
    isFlushing = true


    p.then(() => { // 保证jobQueue中的任务都是在下一个tick中执行 
        jobQueue.forEach(job => {
            job()
        })
    }).finally(() => {
        isFlushing = false
    })
}

const effect = (fn, options) => {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn
        effectStack.push(activeEffect)
        fn()
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
    }
    effectFn.options = options
    effectFn.deps = []
    effectFn()
}

const cleanup = (effectFn) => {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i] //Set集合 
        deps.delete(effectFn) //删除Set集合中的effect

    }
    effectFn.deps.length = 0
}
effect(() => {
    console.log(obj.foo, obj.demo)
}, {
    scheduler(fn) {
        console.log(1111);
        //每次调用时 将副作用函数添加到jobQueue队列中
        jobQueue.add(fn)
        //调用flushJob刷新队列
        flushJob()
    }
})
obj.foo++
console.log(2222);
obj.demo++
console.log(3333);
obj.foo++
console.log(4444);


console.log('结束了')