/*
 * @Author: 大蒙
 * @Date: 2023-02-24 09:06:53
 * @LastEditors: 大蒙
 * @LastEditTime: 2023-02-25 12:48:02
 * @FilePath: /study/mini_vue/effect4.js
 * @Description: 
 * 
 * Copyright (c) 2023, All Rights Reserved. 
 */
const bucket = new WeakMap()
const data = { foo: true, bar: true, demo: 1 }
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
        effectStack.push(activeEffect)
        fn()
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
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
effect(() => {
    debugger
    obj.foo++
})