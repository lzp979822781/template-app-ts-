import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, ScrollView, Text, Button } from '@tarojs/components';
import { Modal } from '@/components/index';

import { connect } from '@tarojs/redux'

import './index.scss'

// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

type dispatchProps = {
    type: string,
    payload: any,
    resolve: any
}

type PageDispatchProps = {
    count: number
    dispatch: (param: dispatchProps) => void
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageDispatchProps & PageOwnProps

interface Test {
    props: IProps;
}

const scrollTop = 0
const Threshold = 20

@connect(({ hello, ...other }) => ({ ...hello, ...other }))
class Test extends Component<any, any> {

    /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
    config: Config = {
        navigationBarTitleText: '测试页'
    }

    static options = {
        addGlobalClass: true
    }

    constructor(props: any) {
        super(props);
        this.state = {
            visible: false
        }

    }

    componentWillReceiveProps(nextProps) {
        console.log(this.props, nextProps)
    }

    componentWillUnmount() { }

    componentDidShow() {

    }

    onScrollToUpper = () => {
        console.log("滚动到顶部");
    }

    onScrollLower = () => {
        console.log("滚动到底部");
    }

    onScroll(e){
        console.log(e.detail)
    }

    onOpenModal = () => {
        this.setState({ visible: true })
    }

    onClose = () => {
        this.setState({ visible: false })
    }

    onConfirm = () => {
        this.onClose();
    }

    renderFooter = () => {
        // const data = [{ text: '取消', onCallFn: this.onClose}, { text: '确定', onCallFn: this.onConfirm }]
        return (
            <View className='test-footer'>
                <Button onClick={this.onClose} className='test-com-btn'>取消</Button>
                <Button onClick={this.onConfirm} className='test-com-btn'>确定</Button>
            </View>
        );
        /* return data.map((item) => {
            const { text, onCallFn } = item;
            return <Button onClick={onCallFn} key={UUID()} className='test-com-btn'>{text}</Button>
        }) */
    }
    

    callModel = (type: string, data = {}) => {
        return new Promise((resolve) => {
            this.props.dispatch({
                type: `hello/${type}`,
                payload: data,
                resolve
            })
        })
    }

    render() {
        const { visible } = this.state;

        return (
            <View className='test'>
                <Button type='primary' onClick={this.onOpenModal}>弹框测试</Button>
                <Modal 
                  visible={visible} 
                  title='弹框'
                  className='test-modal' 
                  // eslint-disable-next-line taro/render-props
                  renderFooter={this.renderFooter()}
                //   footer={footer}
                  onCancel={this.onClose}
                  onConfirm={this.onConfirm}
                  renderContent={<View><Text>content</Text></View>}
                  confirmText='确定'
                  cancelText='取消'
                  customFooter
                />
                    
                <ScrollView
                  className='scrollview'
                  scrollY
                  scrollWithAnimation
                  scrollTop={scrollTop}
                  lowerThreshold={Threshold}
                  upperThreshold={-20}
                  onScrollToUpper={this.onScrollToUpper} // 使用箭头函数的时候 可以这样写 `onScrollToUpper={this.onScrollToUpper}`
                  onScrollToLower={this.onScrollLower}
                  onScroll={this.onScroll}
                >
                    <View className='vStyleA'><Text>A</Text></View>
                    <View className='vStyleB'><Text>B</Text></View>
                    <View className='vStyleC'><Text>C</Text></View>
                </ScrollView>
            </View>
        )
    }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

export default Test as ComponentClass<PageOwnProps, PageState>
