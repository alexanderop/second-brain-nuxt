---
title: "We Ralph Wiggumed WebStreams to Make Them 10x Faster"
type: article
url: "https://vercel.com/blog/we-ralph-wiggumed-webstreams-to-make-them-10x-faster"
tags:
  - performance
  - nodejs
  - web-streams
  - javascript
  - vercel
  - react-server-components
authors:
  - malte-ubl
summary: "Vercel built fast-webstreams, a spec-compliant drop-in replacement for WHATWG Streams that achieves 3-14x throughput improvements by eliminating per-read Promise allocations and routing pipeline chains through Node.js internals."
date: 2026-02-18
---

## The Problem

Native WebStreams (WHATWG Streams API) carry significant overhead for server-side JavaScript. Node.js `pipeline()` hits 7,900 MB/s while native WebStreams `pipeThrough` manages only 630 MB/s — a 12x gap. Every `reader.read()` call triggers four allocations and a microtask queue hop, even when data is already buffered:

1. Allocate a `ReadableStreamDefaultReadRequest` with callback slots
2. Enqueue the request into the stream's internal queue
3. Create a new Promise
4. Resolve through the microtask queue

## The Solution: fast-webstreams

Available as `experimental-fast-webstreams` on npm. Passes 1,100 of 1,116 Web Platform Tests (Node.js passes 1,099).

### Key Optimizations

**Zero-Promise Pipeline Chains** — When chaining `pipeThrough` and `pipeTo` between fast streams, upstream links are recorded without immediate piping. On `pipeTo()`, it traverses upstream, collects underlying Node.js stream objects, and executes a single `pipeline()` call. Result: ~6,200 MB/s (9.8x faster).

**Synchronous Read Resolution** — Attempts synchronous reads via `nodeReadable.read()`. When data is buffered, returns `Promise.resolve({value, done})` without event loop delays. Result: ~12,400 MB/s (3.7x faster).

**React Flight Optimization** — For the RSC byte stream pattern (external enqueuing via captured controller), a custom `LiteReadable` buffer with direct callback dispatch replaces EventEmitter. Result: 1,600 MB/s vs 110 MB/s (14.6x faster).

**Fetch Response Wrapping** — Global `ReadableStream` patching gives native fetch response bodies fast stream shells. Result: 830 MB/s from 260 MB/s (3.2x faster).

## Benchmarks

| Operation    | fast-webstreams | native     | Improvement |
| ------------ | --------------- | ---------- | ----------- |
| read loop    | 12,400 MB/s     | 3,300 MB/s | 3.7x        |
| write loop   | 5,500 MB/s      | 2,300 MB/s | 2.4x        |
| pipeThrough  | 6,200 MB/s      | 630 MB/s   | 9.8x        |
| React Flight | 1,600 MB/s      | 110 MB/s   | 14.6x       |
| 3 transforms | 2,900 MB/s      | —          | 9.7x        |
| 8 transforms | 1,000 MB/s      | —          | 8.7x        |

## Surprising Findings

- "The spec is smarter than it looks" — attempted shortcuts frequently violated WPT for legitimate reasons. The `ReadableStreamDefaultReadRequest` pattern handles edge cases like cancellation during reads and error identity through locked streams.
- `Promise.resolve(obj)` always checks for thenables, affecting object creation in hot paths.
- Node.js `pipeline()` cannot replace WHATWG `pipeTo` due to fundamental differences in error propagation, stream locking, and cancellation semantics.

## Upstream Contributions

Matteo Collina's PR (`nodejs/node#61807`) brings two optimizations directly into Node.js core:

1. **`read()` fast path** — Returns resolved Promises when data is buffered, avoiding request object allocation
2. **`pipeTo()` batch reads** — Processes multiple buffered reads without per-chunk request objects while respecting backpressure

Result: ~17-20% faster buffered reads and ~11% faster `pipeTo` for all Node.js users.

## AI-Assisted Development

Most of fast-webstreams was built with AI assistance, enabled by two factors: 1,116 Web Platform Tests provided machine-checkable correctness validation, and an early benchmark suite measured throughput impact per optimization. The loop: implement → WPT validate → benchmark → revert if tests fail or no improvement.
