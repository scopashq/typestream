import { parse, HTMLElement } from 'node-html-parser'

import { AnyResource, Document } from './base-resource.js'

export abstract class BufferDocuments<
  ResourceMetadata,
  Resource extends AnyResource,
> extends Document<Buffer, ResourceMetadata, Resource> {
  /**
   * Read the document's content and returns
   * it as a JSON object.
   * @param encoding (default `utf-8`)
   * @returns JSON object
   */
  public async asJson(encoding?: BufferEncoding): Promise<any> {
    const document = await this.read()
    const jsonObject = JSON.parse(document.toString(encoding))
    return jsonObject
  }

  /**
   * Read the document's content and returns it
   * it as text.
   * @param encoding (default `utf-8`)
   * @returns text
   */
  public async asText(encoding?: BufferEncoding): Promise<string> {
    const document = await this.read()
    const documentString = document.toString(encoding)
    return documentString
  }

  /**
   * Read the document's content and returns it
   * as an HTMLElement.
   * @param encoding (default `utf-8`)
   * @returns HTMLElement
   */
  public async asHtml(encoding?: BufferEncoding): Promise<HTMLElement> {
    const document = await this.read()
    const documentString = document.toString(encoding)
    const htmlObject = parse(documentString)
    return htmlObject
  }
}
