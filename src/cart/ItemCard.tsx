import React from "react"
import { CartItem } from "./"
import { Typography } from "antd"

interface Props {
  item: CartItem
  checked: boolean
  onCheckedChange: any
}

export default function ItemCard(props: Props) {
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
}
