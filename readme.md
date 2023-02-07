# Description
The front end for [the e-commerce project](e-commerce-app).

# Overview
The main route in the admin is `/dash`. [`DashController`](), which is rendered on this route, makes sure that the client is authenticated before rendering the actual [`Dash`](). Otherwise, it navigates the browser to the sign in page.