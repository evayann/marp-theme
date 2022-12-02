---
title: MyPresentation
# theme: solarized
revealOptions: 
    transition: 'convex'
    width: 100%
    height: 100%
    margin: 0
    # controlsLayout: edges
    # mouseWheel: true
    controls: true
    slideNumber: true
    progress: true
---

<!-- .slide: class="cover" style="--color: linear-gradient(45deg, red, blue)" -->

<div class="titles">

# My presentation

## An amazing presentation 

</div>

![Logo](./themes/assets/pastel/logo.svg) <!-- .element: class="logo" -->

<div class="credit">

-----

By Yann Zavattero

And maybe Reveal.js

And also Reveal-md

</div>

---

<!-- .slide: class="title" -->

# Title page

---


<!-- .slide: class="title" -->

# Title page

## Sub title

---

# Image

![DDD Value Object](https://opus.ch/wp-content/uploads/2019/01/blogvalueobjfactory.png)

---

# List 

- A
- B
- C

---

Bye

---
<!-- .slide: data-transition="slide" data-background="#000" -->
Sub Bar 

* Frag 1 <!-- .element: class="fragment fade-up" -->
* Frag 2 <!-- .element: class="fragment highlight-red" -->

---

<!-- <section data-background="#4d7e65" data-background-transition="zoom" data-markdown> -->
# Background Transitions <!-- .parent: class="test" -->
Different background transitions are available via the backgroundTransition option. This one's called "zoom".
```js
Reveal.configure({ backgroundTransition: 'zoom' })
```

---

# Code

<div class="rows">
<div>
Code 1 :

```ts
function A(x: number): number { /* ... */ }
function B(x: number): number { /* ... */ }
function C(x: number): number { /* ... */ }
```
</div>

<div>
Code 2 :

```ts
class X {
    constructor(private x: number) { }
    A(): number { /* ... */ }
    B(): number { /* ... */ }
    C(): number { /* ... */ }
}
```
</div>

<div>
<p>lalalall</p>
</div>
</div>

----

```js [|1|5-6]
class X {
    constructor(private x: number) { }
    A(): number { /* ... */ }
    B(): number { /* ... */ }
    C(): number { /* ... */ }
}
```

Note: test

----

```js [|1|5-6]
class X {
    constructor(private x: number) { }
    A(): number { /* ... */ }
    B(): number { /* ... */ }
    C(): number { /* ... */ }
}
```

```js [|1|5-6]
class Y {
    constructor(private x: number) { }
    A(): number { /* ... */ }
    B(): number { /* ... */ }
    C(): number { /* ... */ }
}
```

Note: test


---

<!-- .slide: class:"title" data-transition="convex" data-background="#aa0" -->

# Beaucoup de phrase

## Sous titre 1

Aller
Encore 
Du
text <!-- .element: class="test" -->

# Sous titre 2

Et

Avec

Des espaces

---

# List point by point 

1) a
2) b
3) c
4) d

---

A table

|A  | B |  C|
|---|---|---|
| 1 | 2 | 3 |


---

# Une belle tablé !

|A  | B |  C|
|---|---|---|
| 1 | 2 | 3 |