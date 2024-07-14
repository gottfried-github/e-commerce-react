# Description
The front end for the [e-commerce project](https://github.com/gottfried-github/e-commerce-app). Work in progress. 

See the website live [here](http://gottfried.chost.com.ua:3000).

# Overview
## App
The [`App`](https://github.com/gottfried-github/e-commerce-react/blob/master/src/admin.js#L103) defines routes for sign up, log in, sign in and dash. It instantly navigates to `/dash`.

## Dash
The main route in the admin is [`dash/`](https://github.com/gottfried-github/e-commerce-react/blob/master/src/admin.js#L109). [`DashController`](https://github.com/gottfried-github/e-commerce-react/blob/master/src/admin.js#L80), which is rendered on this route, makes sure that the client is authenticated before rendering the actual [`Dash`](https://github.com/gottfried-github/e-commerce-react/blob/master/src/admin.js#L56). Otherwise, it navigates the browser to the sign in page.

## Product
[`useProduct`](https://github.com/gottfried-github/e-commerce-react/blob/master/src/admin/product.js#L35) is the main controller. It modifies data and makes requests to the server. The other components are views. They lift data up to `useProduct` through callbacks.

The [`product/`](https://github.com/gottfried-github/e-commerce-react/blob/master/src/admin.js#L70) route [creates](https://github.com/gottfried-github/e-commerce-react/blob/master/src/admin/product.js#L13) a product and navigates to the created product.

### Price
In the UI, price is represented as two values: one for hryvnias and one for kopiykas. In the data, price is represented in kopyikas. [`hrnToKop`](https://github.com/gottfried-github/e-commerce-react/blob/master/src/admin/product-data.js#L17) and [`kopToHrn`](https://github.com/gottfried-github/e-commerce-react/blob/master/src/admin/product-data.js#L5) provide a mapping between the two representations.

### State vs. api data
The component's state has default values for the fields. The api data simply doesn't contain the fields for which there's no value. [`stateToData`](https://github.com/gottfried-github/e-commerce-react/blob/master/src/admin/product-data.js#L55) and [`dataToState`](https://github.com/gottfried-github/e-commerce-react/blob/master/src/admin/product-data.js#L26) implement a mapping between the two representations as well as integrating price conversion (see [Price](#price)).

### Photos
[`pickCb`](https://github.com/gottfried-github/e-commerce-react/blob/master/src/admin/product.js#L65) adds or removes photos from `photos` (see [`photos_all` and `photos`](https://github.com/gottfried-github/e-commerce-api#photos_all-and-photos)) based on whether the photos are checked in [`PhotosPicker`](https://github.com/gottfried-github/e-commerce-react/blob/master/src/admin/photos-picker.js#L84). [`PhotosPicker`](https://github.com/gottfried-github/e-commerce-react/blob/master/src/admin/photos-picker.js#L84) renders `photos_all` with checkboxes. It is rendered conditionally depending on whether user clicks the 'add photos' button.

### Time
#### Sending time
The [e-commerce project specification](https://github.com/gottfried-github/e-commerce-api#specification) says that time is stored as UTC in the application. 
`Date`'s `now` and `getTime` methods produce time in UTC, without accounting for timezone difference: in `CreateProduct`, I use one of them to add a `time` representing the moment the product is created.

When passed an ISO string to the `Date` constructor, if the timezone information is not included in the string but time information (the info after the `T`) is included (e.g., `2023-01-01T00:00`), the time in the string will be interpreted as local time. In the `Product` view, I read the information on time from the HTML inputs and create a `Date` object with it, which results in it's time being set to the time in UTC, corresponding to the time, specified to the constructor, which is what the API expects.

If no date is set in the date HTML input, but time is set, in the HTML input, I do not send anything to the server.

#### Reading time
##### Converting the value from the REST API into javascript Date object
[The expected format of the value is the ISO format](https://github.com/gottfried-github/e-commerce-api#data-structure), specifying that the time is specified without a timezone: i.e., specifying the trailing `Z` - e.g., `2023-01-01T22:00Z`. This format is interpreted by the `Date` constructor literally: the resulting `Date` object has it's time set to the time, specified in the fed string. 

##### Time representation in the Product controller
`time` has to be sent to the REST API as a number, representing the milliseconds. Hence, the controller should represent it in this format. I thus convert `time` from the string, received from the API into the number in `dataToState`, before it enters the controller.

##### Converting javascript Date object to HTML date/time inputs
HTML `date` and `time` inputs accept values in an ISO format: `YYYY-MM-DD` for `date` and `HH:MM:SS.MMMM` for `time` [`1`]. A `Date` object's `toISOString` method returns global (UTC) time but in the HTML inputs I need local time. 

To convert global time to local, I set the `Date` object's time via `setTime`, passing it it's `getTime` value subtracted from it's `getTimezoneOffset` value, which is `getTimezoneOffset() * 60000` (`getTimezoneOffset` returns the offset in minutes [`2`] and I need it in milliseconds, hence the multiplication by `60000`): the new value has it's global time set to local time of the original date - now I can use `toISOString` and will get the local time of the original date.

###### Notes
1. [`1`]
2. [`2`]

###### Refs
1. https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats
2. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date

### Page identification for CSS
I explicitly specify paths to the different pages to determine whether one of them matches the current location. I then assign a class name to each of the pages and use those class names in CSS to match different pages, for example, to implement the [Header and footer width difference on different pages](https://github.com/gottfried-github/e-commerce-product#header-and-footer-width-difference-on-different-pages) specification.

### Dropdown width and positioning
[The spec](https://github.com/gottfried-github/e-commerce-product#dropdown-width-and-positioning) says that "if items in the dropdown are wider than the head, then the dropdown should be aligned right. If they are narrower, then the dropdown should be aligned left and have the width of the head". 

In [`SortOrderDropdown`](https://github.com/gottfried-github/e-commerce-react/blob/master/src/visitor/filters.js#L43) I achieve this by using React's refs and comparing the widths of the dropdown and the head with javascript. Before comparing, I set the width of the dropdown to `max-width` since that is the width I want to compare (if e.g., the width is `100%`, then the content would wrap to resemble the head, which is not what I want). I then set appropriate class on the dropdown element.

### Determining the `about` section position
In `Home` I use MutationObserver to observe changes to `Products` and get the position of the `About` section based on that. But, for some reason, the position ends up being incorrect in some cases anyway (particularly, when the screen width is about `278px`). To solve that I use `setTimeout` which is not really a satisfiable solution but I haven't found anything better.

### Passing sections positions from `Home` to `Header`
I need the positions of the sections in `Header` in order to scroll to them when clicked on a link in the `Header`. But `Home` renders the sections so it has access to their positions. 

The way I have my routes set up with `React Router` is that I render the `Header` in a parent route to that in which I render the `Home` component: I use `React Router`'s `Outlet` component to place the routes within the parent route. So I need to lift data up from the child route where `Home` is rendered to the parent route where `Header` is rendered, through an `Outlet`. I do that by passing a callback to the `Outlet`, as `context`, which modifies the state of the parent route and passes it down to the `Header`. To consume the `Outlet`'s context in `Home`, I use the `useOutletContext` hook.

### Admin: `react-hook-form` and `mui` - handling checkboxes
When using `register` for `mui` `Checkbox`, when `formState`'s initial value is `true`, the `Checkbox` doesn't appear to be checked, although the underlying `<input>` HTML element is `checked`. 

To omit this problem, I use `useController` for `Checkboxes`.

### Admin: `react-hook-form` validation and reactive `errors`
When I use `useForm`'s `errors` option and update the errors, I run into an issue with the `photo_cover` field.

Let's say I update the errors with an error for `photo_cover`. Then, the next validation returns no error for this field. But the error that I set when updating the errors gets persisted in `useForm`'s `formState`.

Thus I'm forced to trigger `photo_cover`'s `onBlur` each time I update another field in the product data form. I'm aware that it results in duplicate runs of validation, but I haven't found another way of dealing with this.