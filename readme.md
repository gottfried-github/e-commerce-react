# Description
The front end for the [e-commerce project](https://github.com/gottfried-github/e-commerce-app). Work in progress, only some admin routes are implemented.

# Overview
## App
The [`App`]() defines routes for sign up, log in, sign in and dash. It instantly navigates to `/dash`.

## Dash
The main route in the admin is `/dash`. [`DashController`](), which is rendered on this route, makes sure that the client is authenticated before rendering the actual [`Dash`](). Otherwise, it navigates the browser to the sign in page.

## Product
[`Product`]() is the main controller. It modifies data and makes requests to the server. The other components are views. They lift data up to `Product` through callbacks.

### Price
In the UI, price is represented as two values: one for hryvnias and one for kopiykas. In the data, price is represented in kopyikas. [`hrnToKop`]() and [`kopToHrn`]() provide a mapping between the two representations.

### State vs. api data
The component's state has default values for the fields. The api data simply doesn't contain the fields for which there's no value. [`stateToFields`]() and [`fieldsToState`]() implement a mapping between the two representations as well as integrating price conversion (see [Price](#price)).

### Photos
[`pickCb`]() adds or removes photos from `photos` (see [`photos_all` and `photos`](e-commerce#photos_all-and-photos)) based on whether the photos are checked in [`PhotosAll`](). `PhotosAll` renders `photos_all` with checkboxes. It is rendered conditionally depending on whether user clicks the 'add photos' button.