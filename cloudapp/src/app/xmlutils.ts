  /** Execute XPath */
  const select = (doc: Document, expression: string, options: {context?: Node, single?: boolean}={context: null, single: false}) => {
    const evaluator = new XPathEvaluator();
    const resolver = resolverFactory(doc.documentElement);
    return evaluator.evaluate(expression, options.context || doc, resolver, options.single ? XPathResult.FIRST_ORDERED_NODE_TYPE : XPathResult.ANY_TYPE, null);
  }

  const selectSingleNode = (doc: Document, expression: string) => {
    return select(doc, expression, { single: true }).singleNodeValue;
  }

  const selectText= (doc: Document, expression: string) => {
    const node = selectSingleNode(doc, expression);
    return node && node.textContent;
  }

  const resolverFactory = (element: Element): XPathNSResolver => {
    const resolver = element.ownerDocument.createNSResolver(element);
    const defaultNamespace = element.getAttribute('xmlns');
    // @ts-ignore 
    return (prefix: string) => resolver.lookupNamespaceURI(prefix) || defaultNamespace;
  }

  export { select, selectSingleNode, selectText };