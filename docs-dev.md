# Money format
Fi deals with `kopiyka`s representation of `hrn`. E.g., `1.55` `hrn` is `155` `kopiyka`s. This is so because javascript calculates floating point numbers imprecisely. E.g.,
```javascript
0.1 + 0.2 // returns 0.30000000000000004
```
`1` in 'Notes'.

But for user it's convenient to have money represented as `hrn`. So the solution is to have *two inputs: one for `hrn` and the other for `kopiyka`s*.

Programatically I then iterpret these inputs as follows:
* multiply the `hrn` input value by `100` (i.e., represent the `hrn` as `kopiyka`s)
* add the `kopiyka`s input value

## Notes
1. See 'Pitfal #2: Floating point math' in `1`

## Refs
1. https://frontstuff.io/how-to-handle-monetary-values-in-javascript