export function cssCl(mandatory: string, conditionals: Array<any> = []) {
  if (conditionals.length === 0) {
    return mandatory;
  }
  if (conditionals[0].length) {
    return [mandatory].concat(conditionals.map(i => (i[0] ? i[1] : ''))).join(' ');
  }
  return [mandatory].concat([conditionals].map(i => (i[0] ? i[1] : ''))).join(' ');
}
