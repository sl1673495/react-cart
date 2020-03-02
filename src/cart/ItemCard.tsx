import React from "react"
import { CartItem } from "./"
import { OnCheckedChange } from './use-checked'
import { Typography } from "antd"

interface Props {
  item: CartItem
  checked: boolean
  onCheckedChange: OnCheckedChange<CartItem>
}

// memo优化策略
function areEqual(prevProps: Props, nextProps: Props) {
  return (
    prevProps.checked === nextProps.checked
  )
}

const ItemCard = React.memo((props: Props) => {
  console.log('cart item rerender')
  const { item, checked, onCheckedChange } = props
  const { name, price } = item

  const onWrapCheckedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target
    onCheckedChange(item, checked)
  }
  
  return (
    <div className="item-card">
      <div className="checkbox-wrap">
        <input
          type="checkbox"
          checked={checked}
          onChange={onWrapCheckedChange}
        />
      </div>
      <p className="item-info">
        {name} <Typography.Text mark>${price}</Typography.Text>
      </p>
    </div>
  )
}, areEqual)


export default ItemCard