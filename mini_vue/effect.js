/*
 * @Author: 大蒙
 * @Date: 2023-02-20 08:14:06
 * @LastEditors: 大蒙
 * @LastEditTime: 2023-02-20 08:53:42
 * @FilePath: /study/mini_vue/effect.js
 * @Description: 
 * 
 * Copyright (c) 2023 by 启益医疗, All Rights Reserved. 
 */
const bucket = new WeakMap()
const data = { ok: true, text: 'this is a demo' }
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
    console.log('track', target == data);
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
}

const trigger = (target, key) => {
    console.log('trigger', target == data, bucket, bucket.get());
    let depsMap = bucket.get(target) // 获取依赖
    if (!depsMap) return
    let effects = depsMap.get(key)
    effects && effects.forEach(fn => fn())
}

const effect = (fn) => {
    activeEffect = fn
    fn()
}


effect(function () {
    document.body.innerHTML = obj.ok ? obj.text : 'not'
})


setTimeout(() => {
    obj.ok = false
    console.log(data, obj);
}, 5000)
