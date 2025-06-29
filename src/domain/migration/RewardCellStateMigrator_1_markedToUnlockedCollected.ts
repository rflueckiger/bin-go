/**
 * The property "marked" for reward cell state is split into two properties: unlocked and collected.
 * Unlocked signifies the reward can be retrieved now (i.e. row/column of tasks is done), while
 * collected means the reward has been actually claimed.
 *
 * This migrator adjusts existing reward cell states by removing the marked property
 * and replacing it with unlocked/collected attributes.
 */
export class RewardCellStateMigrator_1_markedToUnlockedCollected {
    // @ts-ignore
    static migrate(rewardCellState) {
        if (rewardCellState && typeof rewardCellState === 'object') {
            const hasMarked = 'marked' in rewardCellState;
            const hasUnlocked = 'unlocked' in rewardCellState;
            const hasCollected = 'collected' in rewardCellState;

            if (hasMarked) {
                const marked = !!rewardCellState.marked;
                delete rewardCellState.marked;
                return {
                    ...rewardCellState,
                    unlocked: marked,
                    collected: marked
                };
            }

            if (!hasUnlocked && !hasCollected) {
                return {
                    ...rewardCellState,
                    unlocked: false,
                    collected: false
                };
            }
        }

        return rewardCellState;
    }
}

