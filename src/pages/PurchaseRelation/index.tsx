import Taro, { Component, Config } from "@tarojs/taro";
import { View, Block, Text, Image } from "@tarojs/components";
import DataList from "@/components/DataList/index";
import Header from "@/components/Header";
import StatusBar from "@/components/StatusBar/index";
import JDRequest from "@/utils/jd-request";
import ClockIcon from "@/assets/images/clock-icon@3x.png";
import ShopFailLogo from "@/assets/images/shop-fail-logo@3x.png";

import "./index.scss";

export default class PurchaseRelation extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 1,
            pageSize: 20,
            refreshing: false,
            lastPage: false,
            data: [
                // {
                //     relationId: 1,
                //     shopName: "成都市沙溪镇悦心康大药房成都市沙溪镇悦心康",
                //     auditTime: "2020-05-22 16:40:49",
                //     shopLogo: ""
                // }
            ]
        };
        this.onRefresh = this.onRefresh.bind(this);
        this.onEndReached = this.onEndReached.bind(this);
    }

    config: Config = {
        navigationBarTitleText: "",
        disableScroll: true //currentEnv === "RN"   //使用列表滚动事件，先把外壳默认滚动禁止，防止事件覆盖。
    };

    componentDidShow() {
        this.loadList();
    }

    loadList = async () => {
        const params = this.$router.params;

        Taro.showLoading({
            title: "加载中"
        });

        const { currentPage, pageSize } = this.state;
        const res = await JDRequest.get(
            "mjying_assist_buyer_relation_queryPage",
            {
                pin: params.pin,
                pageNum: currentPage,
                pageSize: pageSize
            }
        );


        if (res.success) {
            this.setVisitListData(res);
        } else {
            this.setState({
                currentPage: currentPage > 1 ? currentPage - 1 : 1,
                refreshing: false
            });
        };

        Taro.hideLoading();
    };

    setVisitListData = (res) => {
        let listData = this.state.data;
        let data = [];
        let lastPage = false;
        const { currentPage } = this.state;

        data = res.data.data;
        lastPage = res.data.lastPage;

        if (currentPage === 1) {
            listData = data;
        } else {
            listData = listData.concat(data);
        }

        this.setState(
            {
                data: listData,
                refreshing: false,
                lastPage
            },
            () => {
                if (data.length < this.state.pageSize) {
                    this.canAction = false;
                } else {
                    setTimeout(() => {
                        this.canAction = true;
                    }, 50);
                };
            }
        );
    };

    onRefresh() {
        this.setState(
            {
                refreshing: true,
                currentPage: 1
            },
            () => {
                this.loadList();
            }
        );
    }

    canAction = false;
    onEndReached() {
        if (this.canAction) {
            Taro.showLoading({
                title: "加载中"
            });
            this.canAction = false;
            const currentPage = this.state.currentPage + 1;

            this.setState(
                {
                    currentPage
                },
                () => {
                    this.loadList();
                }
            );
        }
    }

    renderItems() {
        const dataSource = this.state.data;

        if (dataSource.length === 0) {
            return <Text className='purchaseRelation-list-none' >暂无数据</Text>
        }

        return dataSource.map((item, index) => {
            const className =
                index === 0 ? "list-item-box top-gap" : "list-item-box";
            return (
                <View key={item.relationId} className={className}>
                    <View className='list-item'>
                        <View className='list-image-box'>
                            <Image
                                className='item-image'
                                src={item.shopLogo || ShopFailLogo}
                            />
                        </View>
                        <View className='content-box'>
                            <Text className='item-title'>
                                {item.shopName}
                            </Text>
                        </View>
                    </View>
                    <View className='item-division'></View>
                    <View className='item-dec'>
                        <Image className='item-dec-icon' src={ClockIcon} />
                        <Text className='item-dec-txt'>
                            建材时间：{item.auditTime}
                        </Text>
                    </View>
                </View>
            );
        });
    }

    render() {
        const { lastPage, data } = this.state;
        return (
            <View className='container'>
                <StatusBar />
                <Header title='建采关系' />
                <DataList
                    minusHeight={0}
                    refreshing={this.state.refreshing}
                    onRefresh={this.onRefresh}
                    onEndReached={this.onEndReached}
                >
                    <Block>{this.renderItems()}</Block>
                    {lastPage && data.length > 0 ? <Text className='purchaseRelation-list-none' >没有更多数据了</Text> : null}
                </DataList>
            </View>
        );
    }
}
