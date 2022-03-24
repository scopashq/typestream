# TypeStream

> Next-generation data transformation framework for TypeScript that puts developer experience first

[![](https://img.shields.io/npm/v/@typestream/sdk?style=flat-square)](https://www.npmjs.com/package/@typestream/sdk)

Nowadays, almost every developer is working with increasingly complex and varying types of data.
While tooling for this problem already exists, current solutions are heavy to use, targeted towards big enterprises
and put little to no emphasis on developer experience.

TypeStream allows you to get started within seconds, iterate blazingly fast over type-safe transformation code
and work with common data storage services either locally or in the cloud.

## Installation

```bash
npm install -g @typestream/sdk
```

To get started with a guided tutorial:

```bash
tyst get-started
```

## Features

### Iterate blazingly fast over your transformation code
When writing software, being able to directly see how the changes you've made affect the output is a key feature for efficient and fun development. Thus we have designed TypeStream in a way that let's you see your transformed data anywhere in your pipeline and update it every time you save your code.
If there are errors in your transformation you will get an aggregated overview over the complete sample of datapoints your testing on.

![](https://storage.googleapis.com/typestream-demo-content/dump.gif)

### Step into edge cases, right when they are happening
When working with a lot of data, it's impossible to know every edge case upfront. That's why you'll hit a breakpoint right when an edge case breaks your transformation code to see what the outlier data looks like.
You can also set your own breakpoints anywhere in your transformation code and step through one data sample at a time

![](https://storage.googleapis.com/typestream-demo-content/error.gif)

### Automatic type inference

Everyone who has used a strictly typed language before will love features like advanced IntelliSense, catching bugs at compile-time and the like. Using `typed` you can infer the type of any variable in your pipe based on a statistically relevant sample.

![](https://storage.googleapis.com/typestream-demo-content/typed.gif)

### Data source agnostic

Want to read and write data from your local file system, Google Cloud Storage, S3, BigQuery or Redshift? All at once?
No problem! TypeStream’s modular resource system allows to read from and write to most common storage systems.

### Multi-step pipelines

To keep things more maintainable or to aggregate multiple streams of data into one you can push into a resource in one pipe and consume it in the next.

## Pre-requisites

For TypeStream to work, you will need to have the following software installed already:

- [Node.js](https://nodejs.org/en/download/) (minimum version 16.0.0)
- [Visual Studio Code](https://code.visualstudio.com/download) (optional, strongly recommended)

## Concepts

The three core concepts to understand when working with TypeStream are **resources**, **documents** and **pipes**.
To make each of them more tangible, we will work with an example use-case. If you want to get a more hands-on feeling
for them, you can also use the getting started guide.
An example use case could be that you have raw product data of two different eCommerce platforms - let's say Amazon and eBay. Your goal is to take the raw data from each provider, transform it into a common format and put it into a common storage so you can work with it.

### Resources

One resource holds many documents that are all described by the same concept and have a similar structure. Each resource will also have different metadata
that describe where its data can be retrieved from. Thus, for all of your raw amazon and ebay products you could define your resources as follows:

```typescript
const amazonProduct = new S3Resource('raw-amazon-product', {
  region: 'eu-central-1',
  bucket: 'business-data',
  pathPrefix: 'amazon-products/2022/',
})

const ebayProduct = new CloudStorageResource('raw-ebay-product', {
  cloudStorageProject: 'typestream',
  bucket: 'business-data',
  pathPrefix: 'ebay-products/2022/',
})

// Used to write the transformed data into
const allProducts = new FileResource('transformed-product', {
  basePath: '/Users/typestream/data',
  recursive: true,
})
```

Note that for each type of storage there will be a different resource class with different
kinds of parameters required. As of now, TypeStream supports the following resources:

- Google Cloud Storage
- AWS S3
- BigQuery
- AWS Redshift (coming soon...)
- Local file system

The standard authentication method for both GCP and AWS is authentication via default credentials. You can find
the documentation on how to set up these for each platform here:

- [Setting up Google Cloud Platform default credentials](https://cloud.google.com/sdk/gcloud/reference/auth/application-default)
- [Setting up AWS default credentials](https://docs.aws.amazon.com/accounts/latest/reference/root-user-access-key.html)

Alternatively, you can also provide explicit authentication for a project. If these environment variables are set, default credentials will be ignored entirely. You can set the environment variables by putting their values in the generated `.env` file of your project:

- `GOOGLE_APPLICATION_CREDENTIALS`, which has to be a path to a service-account key. [Use the docs for reference](https://cloud.google.com/docs/authentication/getting-started)
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. [Use the docs for reference](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)

### Documents

Documents are the containers of the data you’re working with. While you will never have to create a document yourself because TypeStream takes care of this under the hood, it makes sense to understand their properties.

Each document has data which will usually be in the form of a Buffer. You can call the `read()` method
of the document to retrieve the data in raw form or helpers like `asJson()`, `asHtml()` or `asText()` to automatically parse the data into the respective format. If the document doesn't contain i.e. valid JSON, an error will be thrown.

```typescript
const buffer = await doc.read() // Buffer
const json = await doc.asJson() // any
const html = await doc.asHtml() // HTMLElement (node-html-parser)
const text = await doc.asText() // string
```

You can also work with the document’s metadata without ever calling `read()` on it. What this looks like is
dependent on what kind of resource the document belongs to. Metadata could for example hold information
about the MIME-type of a Google Cloud Storage object or the path of a file in the local file system.

```typescript
if (doc.metadata.contentType === 'application/json') console.log('Found JSON!')
```

### Pipes

Pipes are the essential building blocks when working with TypeStream. You can think of them as connectors
between resources.

Each pipe has an origin resource from which it will consume data. When defining the pipe, you can transform
the data of a document and then publish it to one or more target resources.

<img width="787" alt="Screenshot 2022-03-18 at 14 00 33" src="https://user-images.githubusercontent.com/59766871/159028449-53767f91-1168-431f-9e00-60b523cac3f3.png">

Working with the example from above, you could write a pipe that reads the documents from `amazonProducts`,
transforms them in any desired way and publishes them to the `allProducts` resource.

```typescript
export default definePipe(ebayProducts, async ctx => {
  const rawProduct = typed('RawProduct', await ctx.doc.asJson())

  const transformedData = ctx.publish({
    // Your transformation code goes here...
    resource: allProducts,
    data: transformedData,
    metdata: { name: transformedData.name },
  })
})
```

You can now write a second pipe for your `ebayProducts` resource and also publish them into `allProducts`.
When hosted via TypeStream Cloud, these pipes will listen for new objects being added to your resources
and process them automatically.

# Transformation utilities

Transforming a lot of data, you easily find yourself repeating different processes time over time. To mitigate this problem TypeStream comes with a few simple utitilities. Each of these utilities is further documented in the TypeStream library

### `dump()`

While using `tyst watch` on a pipe, `dump()` can be used to store all intermediate results into a single file. This can be used to quickly understand how changes in the transformation code affect the output. Every time you save your pipe, dump will overwrite the new intermediate results.

```typescript
const intermediateResult = {
  /** ...your data here*/
}
dump(intermediateResult)
```

### `pick()`

`pick()` can be used to comfortably select a few keys from a messy object. If the object is typed, there will also be autocomplete/type errors on the keys you choose.

```typescript
const messyObject = { key1: 1, key2: 2, key3: 3, key4: 4, key5: 5 }
const prunedObject = pick(messyObject, ['key1', 'key3'])
```

### Hydration utilities

When extracting data from server side rendered applications, automatically extracting the hydration from an HTML response can save a lot of time and nerves.

```typescript
const hydration = extractJsonAssignments(htmlString)
const hydration = extractJsonAssignmentsFromDocument(htmlElement)
const hydration = extractJsonScriptsFromDocument(htmlElement)
```

### Array utilities

Utilities to write more readable code when dealing with arrays

```typescript
products.sort(basedOn((_) => _.price, 'desc'))
products.sort(basedOnKey('price', 'desc'))
products.sort(basedOnMultiple([['price', 'desc'], ['discount', 'asc']]))

sumOf(products.map(product => product.price))
```
