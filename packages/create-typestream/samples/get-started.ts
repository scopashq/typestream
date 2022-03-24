import {
  definePipe,
  typed,
  FileResource,
  CloudStorageResource,
  pick,
  dump,
} from '@typestream/core'

/**
 * The Getting Started Guide will walk you through
 * how to use Typestream to transform your data faster.
 *
 * The developer experience of TypeStream is all based on the `tst watch` command that
 * executes your code as soon as you do changes and gives you insights about it's performance.
 *
 * Use it with:
 * tst watch getting-started-pipe
 *
 * You will access to a data set provided by us (typestream team)
 * via the Google Cloud Storage. To load the data accordingly, we have created a resource
 * that points to the according cloud storage bucket.
 * Instead, you could also read the data from an S3 bucket or local folder.
 *
 * Here, you define the resources that you want the pipe to interact with.
 */
const eCommerceProduct = new CloudStorageResource('e-commerce-product', {
  cloudStorageProject: 'scopas',
  bucket: 'typestream-datasets',
  pathPrefix: 'bestsellers-ecommerce',
})

const transformedProduct = new FileResource('transformed-product', {
  basePath: './output',
  recursive: false,
})

/**
 * Write your code
 * Define your first pipe and process your data.
 * The pipe processes documents one at a time. In our example: eCommerceProduct
 */
export default definePipe(eCommerceProduct, async ctx => {
  /**
   * The context (ctx) allows you to interact with typestream
   * and gives you access to the read and write actions specific to the processed document
   *
   * `asJson()` gives you the current document already parsed as JSON.
   */

  const rawProductData = await ctx.doc.asJson()

  /**
   * When you want your inputs to be typed, you can use the `typed()` function.
   * In watch mode, typestream infers all the types from every object you put through it.
   * The Return value of `typed()` will be typed.
   *
   * The first value is the name of the type
   * and the second argument is the object you want to create types for.
   *
   * (When your editor doesn't show the inferred types, try reloading the editor or the ts-server)
   */
  const productData = typed('ProductData', rawProductData)

  /**
   * In the following you can write your individual transformation code.
   * You can write any code for your transformation
   * or use some of the TypeStream utils (like `pick()`)
   */
  const prunedProduct = pick(productData.product, [
    'product_id',
    'title',
    'rating',
    'manufacturer',
    'description',
    'weight',
  ])

  /**
   * To get a better feeling of what your transformed data looks like, simply
   * use `dump()` to write all the values to a file.
   *
   * You can dump any value (like strings, numbers, and complex objects) and see the results in the
   * "./dump-files" folder.
   */
  dump(prunedProduct)

  dump(prunedProduct.manufacturer, {
    name: 'manufacturer',
    skipDuplicates: true,
  })

  const relatedProducts =
    productData.compare_with_similar?.map(product => product.product_id) ?? []

  const parsedProduct = {
    ...prunedProduct,
    weight: getProductWeight(prunedProduct.weight),
    similarProductIds: relatedProducts,
  }

  /**
   * With publish you write your transformed data to your output resource.
   * The target can be either any typestream resource that you define.
   *
   * If you are done developing this pipe, type `tst process` to actually
   * process and publish all your inputs. You can than see the results in the folder
   * defined in the resource "transformedProduct".
   */
  ctx.publish({
    resource: transformedProduct,
    data: Buffer.from(JSON.stringify(parsedProduct)),
    metadata: { name: `${parsedProduct.product_id}.json` },
  })
})

function getProductWeight(weight: string) {
  const WEIGHT_PATTERN = /\d+\.\d+/
  const weightString = weight.match(WEIGHT_PATTERN)?.[0] ?? '0'
  return Number.parseFloat(weightString)
}
