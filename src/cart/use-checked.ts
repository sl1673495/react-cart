import { useReducer, useEffect, useCallback } from "react"

interface Option {
  /** 用来在map中记录勾选状态的key 一般取id */
  key?: string
}

type CheckedMap = {
  [key: string]: boolean
}

const CHECKED_CHANGE = "CHECKED_CHANGE"

const CHECKED_ALL_CHANGE = "CHECKED_ALL_CHANGE"

const SET_CHECKED_MAP = "SET_CHECKED_MAP"

type CheckedChange<T> = {
  type: typeof CHECKED_CHANGE
  payload: {
    dataItem: T
    checked: boolean
  }
}

type CheckedAllChange = {
  type: typeof CHECKED_ALL_CHANGE
  payload: boolean
}

type SetCheckedMap = {
  type: typeof SET_CHECKED_MAP
  payload: CheckedMap
}

type Action<T> = CheckedChange<T> | CheckedAllChange | SetCheckedMap
export type OnCheckedChange<T> = (item: T, checked: boolean) => any

/**
 * 提供勾选、全选、反选等功能
 * 提供筛选勾选中的数据的函数
 * 在数据更新的时候自动剔除陈旧项
 */
export const useChecked = <T extends Record<string, any>>(
  dataSource: T[],
  { key = "id" }: Option = {},
) => {
  const [checkedMap, dispatch] = useReducer(
    (checkedMapParam: CheckedMap, action: Action<T>) => {
      switch (action.type) {
        case CHECKED_CHANGE: {
          const { payload } = action
          const { dataItem, checked } = payload
          const { [key]: id } = dataItem
          return {
            ...checkedMapParam,
            [id]: checked,
          }
        }
        case CHECKED_ALL_CHANGE: {
          const { payload: newCheckedAll } = action
          const newCheckedMap: CheckedMap = {}
          // 全选
          if (newCheckedAll) {
            dataSource.forEach(dataItem => {
              newCheckedMap[dataItem.id] = true
            })
          }
          return newCheckedMap
        }
        case SET_CHECKED_MAP: {
          return action.payload
        }
        default:
          return checkedMapParam
      }
    },
    {},
  )

  /** 勾选状态变更 */
  const onCheckedChange: OnCheckedChange<T> = useCallback(
    (dataItem, checked) => {
      dispatch({
        type: CHECKED_CHANGE,
        payload: {
          dataItem,
          checked,
        },
      })
    },
    [],
  )

  type FilterCheckedFunc = (item: T) => boolean
  /** 筛选出勾选项 可以传入filter函数继续筛选 */
  const filterChecked = useCallback(
    (func: FilterCheckedFunc = () => true) => {
      return (
        Object.entries(checkedMap)
          .filter(entries => Boolean(entries[1]))
          .map(([checkedId]) =>
            dataSource.find(({ [key]: id }) => id === Number(checkedId)),
          )
          // 有可能勾选了以后直接删除 此时id虽然在checkedMap里 但是dataSource里已经没有这个数据了
          // 先把空项过滤掉 保证外部传入的func拿到的不为undefined
          .filter(Boolean)
          .filter(func as any) as T[]
      )
    },
    [checkedMap, dataSource, key],
  )
  /** 是否全选状态 */
  const checkedAll =
    dataSource.length !== 0 && filterChecked().length === dataSource.length

  /** 全选反选函数 */
  const onCheckedAllChange = (newCheckedAll: boolean) => {
    dispatch({
      type: CHECKED_ALL_CHANGE,
      payload: newCheckedAll,
    })
  }

  // 数据更新的时候 如果勾选中的数据已经不在数据内了 就删除掉
  useEffect(() => {
    filterChecked().forEach((checkedItem) => {
      let changed = false
      if (!dataSource.find(dataItem => checkedItem.id === dataItem.id)) {
        delete checkedMap[checkedItem.id]
        changed = true
      }
      if (changed) {
        dispatch({
          type: SET_CHECKED_MAP,
          payload: Object.assign({}, checkedMap),
        })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource])

  return {
    checkedMap,
    dispatch,
    onCheckedChange,
    filterChecked,
    onCheckedAllChange,
    checkedAll,
  }
}
