export class EmojiUtil {

    public static countEmojis(emojis: string) {
        const emojiRegex = /(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\u200D(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F))*/gu;
        return (emojis.match(emojiRegex) || []).length;
    }
}