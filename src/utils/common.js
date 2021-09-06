import {ref} from "vue";

export function generateRandom(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

export function generateTimer (from, interval = 1000){
    const time = ref(from)
    let int = setInterval(() => {
        time.value = time.value - 1
        if(time.value === 0) {
            clearInterval(int)
        }
    }, 1000)

    return time
}

