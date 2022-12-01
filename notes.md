# Money format
Javascript calculates floating point numbers imprecisely. E.g., 
```javascript
0.1 + 0.2 // returns 0.30000000000000004
```
 `1`. 
 
In fi I need to deal with `hrn`. Here the solution is to represent `hrn` in `kopiyka`s, which is 1/100th of 1 `hrn`. E.g., `1.55 hrn` becomes `155 kopiyka`s.

## Front-end input
Have two separate inputs for `hrn` and `kopiyka`. Then 
* multiply the `hrn` input value by `100` (i.e., represent the `hrn` as `kopiyka`s) and 
* add the `kopiyka`s input value

## Notes
1. See 'Pitfal #2: Floating point math' in `1`

## Refs
1. https://frontstuff.io/how-to-handle-monetary-values-in-javascript