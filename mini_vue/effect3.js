/*
 * @Author: 大蒙
 * @Date: 2023-02-24 09:06:53
 * @LastEditors: 大蒙
 * @LastEditTime: 2023-02-24 09:15:15
 * @FilePath: /study/mini_vue/effect3.js
 * @Description: 
 * 
 * Copyright (c) 2023, All Rights Reserved. 
 */
const bucket = new WeakMap()
const data = { foo: true, bar: true }
let activeEffect = null
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
    activeEffect.deps.push(deps)
}

const trigger = (target, key) => {
    let depsMap = bucket.get(target) // 获取依赖
    if (!depsMap) return
    let effects = depsMap.get(key)

    const effectsToRun = new Set(effects)
    effectsToRun.forEach(effectFn => effectFn())
    // effects && effects.forEach(fn => fn())
}

const effect = (fn) => {
    const effectFn = () => {
        cleanup(effectFn)
        activeEffect = effectFn
        fn()
    }
    effectFn.deps = []
    effectFn()
}

const cleanup = (effectFn) => {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i]
        deps.delete(effectFn)

    }
    effectFn.deps.length = 0
}

let temp1, temp2;
// effect(function () {
//     document.body.innerHTML = obj.ok ? obj.text : 'not'
// })
effect(function effectFn1() {

    console.log('effectFn1执行');

    effect(function effectFn2() {
        console.log('effectFn2执行');
        tmp2 = obj.bar
    })

    temp1 = obj.foo
})


setTimeout(() => {
    debugger
    obj.foo = 34
}, 1000)