import { BigNumber, BigNumberish, utils } from 'ethers'

export const removeTrailingZeros = (str: string): string => {
  return str.replace(/\.?0+$/, '')
}

export const numstrToBN = (input: string, dec: number): BigNumber => {
  if (!input) return BigNumber.from(0)
  const spl = input.split('.')
  if (spl[1]?.length > dec) {
    input = [spl[0], spl[1].slice(0, dec)].join('.')
  }
  return utils.parseUnits(input, dec)
}

export const BNToNumstr = (bn: BigNumberish, dec: number, prec: number): string => {
  let res = BNToNumstrStrict(bn, dec, prec)
  if (res.split('.')[1]) res = removeTrailingZeros(res)
  return res
}

export const BNToNumstrStrict = (bn: BigNumberish, dec: number, prec: number): string => {
  if (!bn) return '0'
  const spl = utils.formatUnits(bn, dec).split('.')
  if (prec === 0) return spl[0]
  return [spl[0], ((spl[1] || '') + '0'.repeat(prec)).slice(0, prec)].join('.')
}
