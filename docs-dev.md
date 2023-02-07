# Money format
Fi deals with `kopiyka`s representation of `hrn`. E.g., `1.55` `hrn` is `155` `kopiyka`s. See api docs for details.

But for user it's convenient to have money represented as `hrn`. So the solution is to have *two inputs: one for `hrn` and the other for `kopiyka`s*.

Programatically I then iterpret these inputs as follows:
* multiply the `hrn` input value by `100` (i.e., represent the `hrn` as `kopiyka`s)
* add the `kopiyka`s input value

# Date format
Javascript builtin `Date` converts time in milliseconds since Unix epoch to human readable format.
