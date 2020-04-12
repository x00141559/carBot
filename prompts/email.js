module.exports = function calcLoanAmount(loanTerm,loanAmount,rate)
{
   // https://www.ifsautoloans.com/blog/car-loan-interest/
    const divisor = 12.00;
  
    const interestRate = rate/divisor;
    //console.log('rate',rate);
    let middle = 1 + (interestRate);
 
    let term =loanTerm*divisor;
    console.log('term',term)
    let top = interestRate* loanAmount;
    let bottom = (1-(middle)**(-term));
    let monthlyRepayment = top/bottom;
        console.log(middle);
        console.log(bottom);
  return `${monthlyRepayment.toFixed(2)}`

  
}
