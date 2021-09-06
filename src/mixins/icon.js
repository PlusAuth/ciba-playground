export const IconMixin = {
    props: {
        size: {
            type: [Number, String],
            default: 24
        },
        color: {
            type: String
        }
    },
    computed: {
        style() {
            const size = typeof this.size === "number" ? `${this.size}px` : this.size
            return {
                width: size,
                height: size,
                color: this.color
            }
        }
    },
}
