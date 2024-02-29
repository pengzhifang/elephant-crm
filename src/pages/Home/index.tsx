import { getLevelApi } from '@service/academic';
import { Local } from '@service/storage';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';

const Home: React.FC = observer(() => {
    useEffect(()=> {
        getLevelApi().then(res => {
            if (res.result) {
                const list = (res.data || []).map(el => {
                    return {label: el, value: el}
                });
                const levels = list.length > 0  ? [{label: '全部', value: ''}, ...list] : []
                Local.set('levels', levels);
            }
        })
    }, []);
    
    return (
        <div></div>
    );
})
export default Home;