# Description
The front end for the [e-commerce project](https://github.com/gottfried-github/e-commerce-app). Work in progress, only some admin routes are implemented.

# Overview
## App
The [`App`](https://github.com/gottfried-github/e-commerce-react/blob/3856592373852b3f211067bd720516c8919251da/src/admin.js#L103) defines routes for sign up, log in, sign in and dash. It instantly navigates to `/dash`.

## Dash
The main route in the admin is [`dash/`](https://github.com/gottfried-github/e-commerce-react/blob/3856592373852b3f211067bd720516c8919251da/src/admin.js#L109). [`DashController`](https://github.com/gottfried-github/e-commerce-react/blob/3856592373852b3f211067bd720516c8919251da/src/admin.js#L80), which is rendered on this route, makes sure that the client is authenticated before rendering the actual [`Dash`](https://github.com/gottfried-github/e-commerce-react/blob/3856592373852b3f211067bd720516c8919251da/src/admin.js#L56). Otherwise, it navigates the browser to the sign in page.

## Product
[`Product`](https://github.com/gottfried-github/e-commerce-react/blob/3856592373852b3f211067bd720516c8919251da/src/admin/product.js#L102) is the main controller. It modifies data and makes requests to the server. The other components are views. They lift data up to [Product](https://github.com/gottfried-github/e-commerce-react/blob/3856592373852b3f211067bd720516c8919251da/src/admin/product.js#L102) through callbacks.

The [`product/`](https://github.com/gottfried-github/e-commerce-react/blob/3856592373852b3f211067bd720516c8919251da/src/admin.js#L70) route [creates](https://github.com/gottfried-github/e-commerce-react/blob/3856592373852b3f211067bd720516c8919251da/src/admin/product.js#L80) a product and navigates to the created product.

### Price
In the UI, price is represented as two values: one for hryvnias and one for kopiykas. In the data, price is represented in kopyikas. [`hrnToKop`](https://github.com/gottfried-github/e-commerce-react/blob/3856592373852b3f211067bd720516c8919251da/src/admin/product.js#L22) and [`kopToHrn`](https://github.com/gottfried-github/e-commerce-react/blob/3856592373852b3f211067bd720516c8919251da/src/admin/product.js#L10) provide a mapping between the two representations.

### State vs. api data
The component's state has default values for the fields. The api data simply doesn't contain the fields for which there's no value. [`stateToFields`](https://github.com/gottfried-github/e-commerce-react/blob/3856592373852b3f211067bd720516c8919251da/src/admin/product.js#L59) and [`fieldsToState`](https://github.com/gottfried-github/e-commerce-react/blob/3856592373852b3f211067bd720516c8919251da/src/admin/product.js#L30) implement a mapping between the two representations as well as integrating price conversion (see [Price](#price)).

### Photos
[`pickCb`](https://github.com/gottfried-github/e-commerce-react/blob/3856592373852b3f211067bd720516c8919251da/src/admin/product.js#L135) adds or removes photos from `photos` (see [`photos_all` and `photos`](https://github.com/gottfried-github/e-commerce-api#photos_all-and-photos)) based on whether the photos are checked in [`PhotosAll`](https://github.com/gottfried-github/e-commerce-react/blob/3856592373852b3f211067bd720516c8919251da/src/admin/product.js#L187). [`PhotosAll`](https://github.com/gottfried-github/e-commerce-react/blob/3856592373852b3f211067bd720516c8919251da/src/admin/product.js#L187) renders `photos_all` with checkboxes. It is rendered conditionally depending on whether user clicks the 'add photos' button.