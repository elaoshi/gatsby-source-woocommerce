# Note
**Please note: the original author of this package is [Marc Glasser](https://github.com/marcaaron/) -- see the [the original repo](https://github.com/marcaaron/gatsby-source-woocommerce) and [package](https://www.npmjs.com/package/gatsby-source-woocommerce).**

# gatsby-source-woocommerce
Source plugin for [Gatsby](https://www.gatsbyjs.org/). Pulls in data from protected routes via the [WooCommerce REST API](http://woocommerce.github.io/woocommerce-rest-api-docs/) with credentials.

## Contents
- [Install](#install)
- [How to Use](#how-to-use)
- [Currently Supported Fields](#currently-supported-fields)
- [GraphQL Query Examples](#some-graphql-query-examples)
- [Integration with gatsby-image](#integration-with-gatsby-image)
- [Changelog](#changelog)


## Install

`npm install --save @elaoshi/gatsby-source-woocommerce`

or 

`yarn add @elaoshi/gatsby-source-woocommerce`

## How to Use

```javascript
// In gatsby-config.js
plugins:[
  {       
    resolve: '@elaoshi/gatsby-source-woocommerce',
    options: {
	   // Base URL of Wordpress site
      api: 'wordpress.domain',
      // true if using https. otherwise false.
      https: false,
      api_keys: {
        consumer_key: <key>,
        consumer_secret: <secret>,
      },
      // Array of strings with fields you'd like to create nodes for...
      fields: ['products', 'products/categories'],
      // Send the API keys as query string parameters instead of using the authorization header
      // OPTIONAL: defaults to false
      query_string_auth: false,
      // Version of the woocommerce API to use
      // OPTIONAL: defaults to 'wc/v3'
      api_version: 'wc/v3',
      // OPTIONAL: How many results to retrieve *per request*
      per_page: 100,
      // OPTIONAL: Custom WP REST API url prefix, only needed if not using 
      // the default wp-json prefix.
      wpAPIPrefix: 'wp-rest',
      // OPTIONAL: Support for URLs with ports, e.g. 8080; defaults to no port
      port: '8080',
      // OPTIONAL: Encoding; default to 'utf8'
      encoding: 'utf8',
      // OPTIONAL: Custom Axios config (see https://github.com/axios/axios) - note that this can override other options.
      axios_config: {
        // Axios config options
      },
      // OPTIONAL: Support just fetch products from a special category id. 
      // categories: [29,99]
      // OPTIONAL: Support fetch products options. 
      fetchOptions : {
        // status:"publish",
        // stock_status:"instock"
      }
    }
  }
]
```

## Currently Supported Fields

Definitive: 
- Products
- Customers
- Orders
- Reports
- Coupons

**Note**: If following the endpoint layout from the [WooCommerce REST API docs](https://woocommerce.github.io/woocommerce-rest-api-docs/?php#introduction), all fields that do not contain a wildcard *should* be supported.

For example, to get product categories: including 'products/categories' in fields will show up as allWcProductsCategories / wcProductsCategories

## Some GraphQL Query Examples

### All products (with associated images):
```graphql
{
  allWcProducts {
    edges {
      node {
        id
        wordpress_id
        name
        categories {
          wordpress_id
        }
        images {
          localFile {
            // childImageSharp ... etc
          }
        }
      }
    }
  }
}
```

### All product categories (with associated image):
```graphql
{
  allWcProductsCategories {
    edges {
      node {
        id
        wordpress_id
        name
        slug
        image {
          localFile {
            // childImageSharp ... etc
          }
        }
      }
    }
  }
}
```

### Specific product by wordpress ID:
```graphql
{
  wcProducts(wordpress_id: {eq: 12}) {
    name
    price
    related_ids
  }
}
```

### Specific product by wordpress ID, with related products:
```graphql
{
  wcProducts(wordpress_id: {eq: 12}) {
    name
    price
    related_products {
      name
      // etc - same fields as a normal product
    }
  }
}
```

### Specific grouped product by wordpress ID, with links to each product grouped:
```graphql
{
  wcProducts(wordpress_id: {eq: 12}) {
    name
    price
    grouped_products_nodes {
      name
      // etc - same fields as a normal product
    }
  }
}
```

### Specific product, with variations:
```graphql
{
  wcProducts(wordpress_id: {eq: 12}) {
    wordpress_id
    name
    price_html
    product_variations {
      # Note: ID, not wordpress_id
      id 
      # Note: no price_html inside variations
      price 
      description
      attributes {
        # The compination of attributes making up this variation. Missing attribute = any
        name
        option
      }
    }
    
  }
}
```

### Specific product category (with associated products):
```graphql
{
  wcProductsCategories(wordpress_id: {eq: 20}) {
     name
     slug
     products {
       name
       price
       images {
         localFile {
           // childImageSharp ... etc
         }
       }
     }
   }
}
```

### All Product Tags and their associated products:
```graphql
{
  allWcProductsTags {
    nodes {
      name
      count
      products {
        name
      }
    }
  }
}
```

## Integration with `gatsby-image`

You can use images coming from this plugin with [gatsby-image](https://www.gatsbyjs.org/packages/gatsby-image/). `gatsby-image` is a React component specially designed to work seamlessly with Gatsby’s GraphQL queries. It combines Gatsby’s native image processing capabilities with advanced image loading techniques to easily and completely optimize image loading for your sites.

To use this, you will first need to install and configure it and its dependencies.

```bash
npm install gatsby-image gatsby-transformer-sharp gatsby-plugin-sharp
```

Then add these plugins to `gatsby-config.js`:

```javascript
plugins: [`gatsby-transformer-sharp`, `gatsby-plugin-sharp`]
```

You can then use the `gatsby-image` component:

```javascript
import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

export default ({ data }) => (
  <div>
    <h1>Hello gatsby-image</h1>
    <Img fluid={data.wcProducts.images[0].localFile.childImageSharp.fluid} alt={data.wcProducts.images[0].alt} />
  </div>
)

export const query = graphql`
  query allProducts {
     wcProducts (slug: {
        eq: "test-product"
      }) {
        id
        name
        images {
          alt
          localFile {
            childImageSharp {
              fluid {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
  }
`
```

Some example queries for the fixed and fluid types are below.

### Responsive Fluid

```graphql
{
  wcProducts (slug: {
    eq: "test-product"
  }) {
    id
    name
    images {
      alt
      localFile {
        childImageSharp {
          fluid (maxWidth: 800, cropFocus: CENTER) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  }
}
```

### Responsive Fixed

```graphql
{
  wcProducts (slug: {
    eq: "test-product"
  }) {
    id
    name
    images {
      alt
      localFile {
        childImageSharp {
          fixed (width: 800, toFormat: JPG) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  }
}
```

### Resize

```graphql
{
  wcProducts (slug: {
    eq: "test-product"
  }) {
    id
    name
    images {
      alt
      localFile {
        childImageSharp {
          resize (width: 800, height: 600, cropFocus: CENTER, quality: 80) {
            src
          }
        }
      }
    }
  }
}
```

You can visit [gatsby-image](https://www.gatsbyjs.org/packages/gatsby-image/) for more information, and to learn about the different types of queries.

## Changelog
categories
- 0.12.3:  Support fetching products from multiple categories  [Elaoshi](https://github.com/elaoshi).
- 0.12.0:  Add options for fetching products [Elaoshi](https://github.com/elaoshi).
- 0.11.2:  Add category id of products fetched from server in configration [Elaoshi](https://github.com/elaoshi).
- 0.11.0: [Add wordpress_parent_id field](https://github.com/pasdo501/gatsby-source-woocommerce/pull/20), to get around the `parent` field being overriden by the GraphQL node parent field. Additionally, also added wordpress_parent & wordpress_children bidirectional links to the nodes themselves.
- 0.10.0: Expanded API config options, including [Basic Authentication as query string](https://github.com/pasdo501/gatsby-source-woocommerce/commit/9bcbafdbf22921bea6afa7a3b786764c2ac6fd25), and [custom port, encoding, & axios config options](https://github.com/pasdo501/gatsby-source-woocommerce/commit/be3bc2d28b040d31c441cea5b13efb08026fba87).
- 0.9.0: [ACF image support](https://github.com/pasdo501/gatsby-source-woocommerce/commit/f5f84c23a7ca33f4f1a4848edda7e699f2e2759a), c/o [8ctopotamus](https://github.com/8ctopotamus). [Test suite extension](https://github.com/pasdo501/gatsby-source-woocommerce/commit/6b00342ee58876c8655e345bed367adf07338ec4) (node processing, without field mapping). Revert case insensitive field names - API request doesn't care, but allows for fields with capitals; more freedom to the dev.
- 0.8.1: Case insensitive field names & start of test suite c/o [Siemah](https://github.com/siemah)
- 0.8.0: Add wpAPIPrefix option for custom WP REST API url prefix.
- 0.7.0: Change to [new library to access the WooCommerce REST API](https://github.com/woocommerce/woocommerce-rest-api-js-lib), since [the old one is now obsolete](https://github.com/woocommerce/wc-api-node). Change behaviour to pull in all resources of a given field name, when there are more resources than the value of the per_page option. Make 'wc/v3' default API version.
- 0.6.2: [Fix race condition when adding sharp images to products](https://github.com/pasdo501/gatsby-source-woocommerce/commit/e37d841c54227a9011cfc2f9b7e971e78b86a257)
- 0.6.1: Add Gatsby Image support (localFile field) to product variations images.
- 0.6.0: Properly support product variations, accessible through the product_variations field on products.
- 0.5.0: Added grouped_products_nodes field to products. Points to the node of each grouped product (or an empty array if not a grouped product). Grouped product nodes found under grouped_products_nodes rather than grouped_products to allow for backwards compatibility.
- 0.4.0: Also map related products as product nodes, rather than just an array of IDs
- 0.3.5: Gatsby Image related documentation c/o [Travis Reynolds](https://github.com/thetre97)
- 0.3.4: Mapping products & tags to each other
- 0.3.3: Fixing issues related to product - category mapping, API version. (Thank you [Travis Reynolds](https://github.com/thetre97)).
         Product categories IDs can now also be accessed with wordpress_id when no category nodes are pulled in. This is to keep access consistent,
         whether or not categories are used. Previously, without the 'products/categories' field, product category ID was accessed as product<span />.categories.id (an integer),
         while with the 'products/categories' field, it was product.categories.wordpress_id (since categories<span />.id is now the node ID - a string).
- 0.3.2: Mapping products & categories to each other
- 0.3.0: Associated products & product categories with local file images downloaded during the build process to allow use of image transform plugins.
