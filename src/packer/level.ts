import { bestdoriToLevelData, type BestdoriChart } from 'sonolus-bandori-engine'
import type { PackLevelData } from '.'

export const packLevelData: PackLevelData = ({ chart, offset }) => {
    const bestdoriChart = JSON.parse(chart) as BestdoriChart
    const levelData = bestdoriToLevelData(bestdoriChart, offset)

    return { type: 'json', data: levelData }
}
