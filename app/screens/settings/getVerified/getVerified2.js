import React, {Component} from 'react'
import {View, Text, StyleSheet, TouchableHighlight, AsyncStorage, Alert} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import Colors from './../../../config/colors'
import Header from './../../../components/header'
import Option from './../../../components/getVerifiedOption'
import SettingsService from './../../../services/settingsService'
import UserInfoService from './../../../services/userInfoService'

export default class GetVerified extends Component {
    static navigationOptions = {
        title: 'Get verified',
    }

    constructor(props) {
        super(props);
        this.state = {
            user: '',
            email: '',
            email_status:'',
            mobile_number: '',
            mobile_number_status:'',
            basic_info: '',
            basic_info_status:'',
            address: '',
            address_status:'',
            identification: '',
            identification_status:'',
            document: '',
            document_status:'',
        }
    }

    async componentWillMount() {
        let user = await AsyncStorage.getItem('user')
        user = JSON.parse(user)
        this.setState({
            user: user,
            email:user.email,
            mobile_number:user.mobile_number,
            basic_info:user.first_name +' '+ user.last_name,
        })
        let responseJson = await SettingsService.getAllEmails()
        if (responseJson.status === "success") {
            const data = responseJson.data;
            for (let i = 0; i < data.length; i++) {
                if (data[i].verified === 'true') {
                    this.setState({
                        email_status: 'Verified'
                    })
                }
            }
            if (this.state.email_status !== 'Verified') {
                this.setState({
                    email_status: 'Pending'
                })
            }
        }
        else {
            Alert.alert('Error',
                responseJson.message,
                [{text: 'OK'}])
        }

        let responseJsonMobile = await SettingsService.getAllMobiles()
        if (responseJsonMobile.status === 'success') {
            const data = responseJsonMobile.data
            if (data.length == 0) {
                this.setState({
                    mobile_number_status: 'Incomplete'
                })
            } else {
                for (let i = 0; i < data.length; i++) {
                    if (data[i].verified) {
                        this.setState({
                            mobile_number_status:'Verified'
                        })
                    }
                }
                if(this.state.mobile_number_status!='Verified'){
                    this.setState({
                        mobile_number_status:'Pending'
                    })
                }
            }
        }

        let responseJsonAddress =await UserInfoService.getAddress()
        if(responseJsonAddress.status==='success'){
            const data=responseJsonAddress.data
            this.setState({
                address:data.line_1+','+data.line_2+','+data.city+','+data.state_province+','+data.country+','+data.postal_code,
                address_status:data.status
            })
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Header
                    navigation={this.props.navigation}
                    back
                    homeRight
                    title="Get verified"
                />
                <View style={{flex: 1, paddingTop: 10}}>
                    <Option title="Email" subtitle={this.state.email} buttonText={this.state.email_status.toUpperCase()}/>
                    <Option title="Mobile" subtitle={this.state.mobile_number} buttonText={this.state.mobile_number_status.toUpperCase()}/>
                    <Option title="Basic Info" subtitle={this.state.basic_info}
                            buttonText="INCOMPLETE"/>
                    <Option title="Address" subtitle={this.state.address} buttonText={this.state.address_status.toUpperCase()}/>
                    <Option title="Proof of Identification" subtitle="Waiting for approval" buttonText="COMPLETE"/>
                    <Option title="Proof of Address" subtitle="Waiting for approval" buttonText="PENDING"/>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
})
