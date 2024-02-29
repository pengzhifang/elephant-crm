/**
 * 倒计时hooks函数
 */
import { useEffect, useState } from 'react';

const useCountDown = (count) => {
    const [seconds, setSeconds] = useState(count);
    let timer = null;
    useEffect(() => {
        timer = setTimeout(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1);
            }
        }, 1000);
        return () => {
            timer && clearTimeout(timer);
        }
    }, [seconds]);

    return [seconds, setSeconds];
};
export default useCountDown;