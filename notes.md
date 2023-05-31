# Dates
## Converting javascript Date object to HTML date/time inputs
HTML `date` and `time` inputs accept values in an ISO format: `YYYY-MM-DD` for `date` and `HH:MM:SS.MMMM` for `time` [`1`]. A `Date` object's `toISOString` method returns global (UTC) time but in the HTML inputs I need local time. 

To convert global time to local, I set the `Date` object's time via `setTime`, passing it it's `getTime` value subtracted from it's `getTimezoneOffset` value, which is `getTimezoneOffset() * 60000` (`getTimezoneOffset` returns the offset in minutes [`2`] and I need it in milliseconds, hence the multiplication by `60000`): the new value has it's global time set to local time of the original date - now I can use `toISOString` and will get the local time of the original date.

## Notes
1. [`1`]
2. [`2`]

## Refs
1. https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats
2. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date

# Money UI: interpreting user input
For `kopiyka`s input the following seems an intuitive interpretation (though, the input's units, `kopiyka`s, are explicitly stated to the user):
if user inputs `5` they mean `50`. If they mean `5` they should input `05`. 

How to implement such interpretation programatically? 
A way to do that would be to multiply any number smaller than `10` by `10`, except when it's preceded with a zero.

But there's no way to distinguish a number with leading zeros from the same number without those. E.g., `05 === 5` is `true`; similarly, `05.toString()` is `'5'`. 

The solution is to use `String` as the source of truth (i.e., `<input type='text' />`). With a simple regex, `/^[0-9]*$/`, we can make sure that the string contains only digits (`1`). We can then identify numbers with leading zeros when the string's length is more than `1` and the string's equivalent number is < `10`. I.e., `'01'.length > 1 && Number('01') < 10`.

## Notes
1. `1`

## Refs
1. https://stackoverflow.com/a/54858205/11053968