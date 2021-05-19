import React from 'react';
import {nanoid} from 'nanoid';

function YearTable(props) {
    console.log('YearTable', props);
    return (
        <div>
            <h2>Year Table</h2>
            <table>
                <tbody>
                  <tr>
                      <th>Year</th>
                      <th>Amount</th>
                  </tr>
                  {props.list.map(item => (
                      <tr>
                          <td>{item.year}</td>
                          <td>{item.amount}</td>
                      </tr>
                  ))}
                </tbody>
            </table>
        </div>
    );
};

function SortTable(props) {
    console.log('SortTable', props);
    return (
        <div>
            <h2>Sort Table</h2>
            <table>
              <tbody>
                <tr>
                    <th>Date</th>
                    <th>Amount</th>
                </tr>
                {props.list.map(item => (
                    <tr key={nanoid()}>
                        <td>{item.date}</td>
                        <td>{item.amount}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

function MonthTable(props) {
    console.log('MonthTable', props);
    return (
        <div>
            <h2>Month Table</h2>
            <table>
              <tbody>
                <tr>
                    <th>Month</th>
                    <th>Amount</th>
                </tr>
                {props.list.map(item => (
                    <tr>
                        <td>{item.month}</td>
                        <td>{item.amount}</td>
                    </tr>
                ))}
              </tbody>
            </table>
        </div>
    );
};

function sortedFunc(props) {
  for (let i = 0; i < props.list.length; i++) { 
    let wasSwap = false;
    for (let j = 0; j < props.list.length - i - 1; j++) { 
        if (new Date(props.list[j].date).getTime() < new Date(props.list[j + 1].date).getTime()) { 
            let temp = props.list[j + 1]; 
            props.list[j + 1] = props.list[j]; 
            props.list[j]= temp;
            wasSwap = true; 
        }
    }
    if (!wasSwap) break;
  } 
  return props     
}

function withSorted(Table) {  
  return class extends React.Component { 
    render() {
      const unsorted = this.props;
      const sorted = sortedFunc(unsorted);
      return <Table {...sorted} />
    }
  }
}
const UpdSortTable = withSorted(SortTable);

function convertDateToMonthYear(props) { /*конвертация даты в формат 'Месяц год' */
  let listOfMonthsYears = [];
  props.list.map(item => {
    const month = new Date(item.date).toLocaleString('en-us', { month: 'short'});
    const year = new Date(item.date).getFullYear()
    listOfMonthsYears.push({'month': `${month} ${year}`, 'amount': item.amount})
  })  
  return {'list': listOfMonthsYears}
}

function groupOnPeriod(props, period) { /*группировка по периоду*/
  console.log(period)
  const uniqDate = [];
    props.list.map(item => {
      uniqDate.indexOf(item[period]) < 0 && uniqDate.push(item[period]);
  })
  let sum = 0;
  let newProps = []
  uniqDate.map(uniqItem => {
    sum = 0
    props.list.forEach(item => {
      if (item[period] === uniqItem) {
        sum += Number(item.amount)
      }
    })
    newProps.push({[period]: uniqItem,  'amount': sum})    
  })
  return {'list': newProps}
}

function convertDateToYear(props) { /*конвертация даты в формат 'Год' */
  let listOfYears = [];
  props.list.map(item => {
    console.log(item)
    const year = new Date(item.date).getFullYear()
    console.log(year)
    listOfYears.push({'year': `${year}`, 'amount': item.amount})
  })
  console.log( {'list': listOfYears})
  return {'list': listOfYears}
}

function withGroupedMonthYear(Table) {
  return class extends React.Component { 
    render() {
      const sortedDates = sortedFunc(this.props)
      const sortedMonthYear = convertDateToMonthYear(sortedDates);
      const groupedAmount = groupOnPeriod(sortedMonthYear, 'month')
      return <Table {...groupedAmount} />
    }
  }
}

const UpdMonthTable = withGroupedMonthYear(MonthTable);

function withGroupedYear(Table) {
  return class extends React.Component { 
    render() {
      const sortedDates = sortedFunc(this.props)
      const sortedYear = convertDateToYear(sortedDates);
      const groupedAmount = groupOnPeriod(sortedYear, 'year')
      return <Table {...groupedAmount} />
    }
  }
}
const UpdYearTable = withGroupedYear(YearTable);
// TODO:
// 1. Загрузите данные с помощью fetch: https://raw.githubusercontent.com/netology-code/ra16-homeworks/master/hoc/aggregation/data/data.json
// 2. Не забудьте вынести URL в переменные окружения (не хардкодьте их здесь)
// 3. Положите их в state

export default class App extends React.Component {
    state = {
        list: []
    };
    componentDidMount() {
      fetch(process.env.REACT_APP_CURRENCY_URL)
        .then(response => response.json())
        .then(list => this.setState(list))
    }

    render() {
        const {list} = this.state;
        return (
            <div id="app">
                <UpdMonthTable list={list} />
                <UpdYearTable list={list} />
                <UpdSortTable list={list} />
            </div>
        );
    }
}