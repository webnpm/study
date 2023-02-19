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
    let depsMap = bucket.get[target]
    console.log(depsMap);
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
    console.log('get', bucket.get(target));
    obj.ok = false
}, 5000)
