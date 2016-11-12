import React, { Component, PropTypes } from 'react'
import ReactNative from 'react-native'
import times from 'lodash.times'

var {
  StyleSheet,
  ScrollView,
  Dimensions,
  Text,
  View,
} = ReactNative

const GAUGE_WIDTH = Math.floor(Dimensions.get('window').width)
const INTERVAL_WIDTH =  18

const scale = (v, inputMin, inputMax, outputMin, outputMax) => {
  return Math.floor(((v - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin)
}

export default class LineGauge extends Component {
  constructor(props) {
    super(props)

    this._handleScroll = this._handleScroll.bind(this)

    this.scrollMin = 0
    this.scrollMax = this._getScrollMax(props)

    this.state = {
      contentOffset: this._scaleValue(props.initialValue || props.min),
    }
  }

  componentWillReceiveProps(nextProps) {
    this.scrollMax = this._getScrollMax(nextProps)
  }

  value(val) {
    this.setState({
      contentOffset: this._scaleValue(val)
    })
  }

  _getScrollMax(props = this.props) {
    return (props.max - props.min) * INTERVAL_WIDTH
  }

  _scaleScroll(x) {
    let { min, max } = this.props
    return scale(x, this.scrollMin, this.scrollMax, min, max)
  }

  _scaleValue(v) {
    let { min, max } = this.props
    return scale(v, min, max, this.scrollMin, this.scrollMax)
  }

  _handleScroll(event) {
    let offset = event.nativeEvent.contentOffset.x
    let { min, max } = this.props

    let val = this._scaleScroll(offset)
    val = val < min ? min : val
    val = val > max ? max : val

    this.props.onChange(val)
  }

  _getIntervalSize(val) {
    let { largeInterval, mediumInterval } = this.props

    if (val % largeInterval == 0) return 'large'
    if (val % mediumInterval == 0) return 'medium'
    return 'small'
  }

  _renderIntervals() {
    let { min, max } = this.props
    let range = max - min + 1

    let values = times(range, (i) => i + min)

    return values.map((val, i) => {
      let intervalSize = this._getIntervalSize(val)

      return (
        <View key={`val-${i}`} style={styles.intervalContainer}>
          {intervalSize === 'large' && (
            <Text style={styles.intervalValue}>{val}</Text>
          )}

          <View style={[styles.interval, styles[intervalSize]]}/>
        </View>
      )
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          automaticallyAdjustInsets={false}
          horizontal={true}
          decelerationRate={0}
          snapToInterval={INTERVAL_WIDTH}
          snapToAlignment="start"
          showsHorizontalScrollIndicator={false}
          onScroll={this._handleScroll}
          scrollEventThrottle={100}
          contentOffset={{ x: this.state.contentOffset }}>

          <View style={styles.intervals}>
            {this._renderIntervals()}
          </View>
        </ScrollView>

        <View style={styles.centerline} />
      </View>
    )
  }
}

LineGauge.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  largeInterval: PropTypes.number,
  mediumInterval: PropTypes.number,
  initialValue: PropTypes.number,
  onChange: PropTypes.func
}

LineGauge.defaultProps = {
  min: 1,
  max: 100,
  mediumInterval: 5,
  largeInterval: 10,
  onChange: () => {}
}

var styles = StyleSheet.create({
  container: {
    height: 55,
    width: GAUGE_WIDTH,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#DDDDDD',
    borderBottomColor: '#DDDDDD',
    backgroundColor: '#F9F9F9',
    marginVertical: 8,
  },
  intervals: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: GAUGE_WIDTH / 2,
    marginHorizontal: -INTERVAL_WIDTH / 2,
  },
  intervalContainer: {
    width: INTERVAL_WIDTH,
    alignItems: 'center',
  },
  interval: {
    width: 1,
    marginRight: -1,
    backgroundColor: '#979797',
  },
  intervalValue: {
    fontSize: 9,
    marginBottom: 3,
    fontWeight: 'bold',
  },
  small: {
    height: 13,
  },
  medium: {
    height: 20,
  },
  large: {
    backgroundColor: '#4A4A4A',
    width: 2,
    height: 26,
  },
  centerline: {
    height: 54,
    width: 1,
    backgroundColor: 'red',
    position: 'absolute',
    left: GAUGE_WIDTH / 2,
    opacity: 0.6,
    top: 0,
    zIndex: -1
  },
})
