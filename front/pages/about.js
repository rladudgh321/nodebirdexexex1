import React from 'react';
import { Card, Avatar } from 'antd';
import { useSelector } from 'react-redux';
import wrapper from '../store/configureStore';
import { END } from 'redux-saga';
import { LOAD_USER_REQUEST } from '../reducers/user';
import AppLayout from '../components/AppLayout';

const About = () => {
    const { userInfo } = useSelector((state) => state.user);
    return (
        <AppLayout>
            {
                userInfo
                ?
                    (<Card
                        actions={[
                            <div key='twit'>짹짹<br />{userInfo.Posts}</div>,
                            <div key='followings'>팔로잉<br />{userInfo.Followings}</div>,
                            <div key='followers'>팔로워<br />{userInfo.Followers}</div>,
                        ]}
                    >
                        <Card.Meta
                            avatar ={ <Avatar>{userInfo.nickname[0]}</Avatar> }
                            title = { userInfo.nickname }
                            description= "노드버드 매니아"
                        />
                    </Card>)
                : null
            }
        </AppLayout>
    );
}

export const getStaticProps = wrapper.getStaticProps( async (context) => {
    context.store.dispatch({
        type: LOAD_USER_REQUEST,
        data: 1,
    });
    context.store.dispatch(END);
    await context.store.sagaTask.toPromise();
});

export default About;