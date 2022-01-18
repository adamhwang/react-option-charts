declare module 'black-scholes' {
    /**
     * Black-Scholes option pricing formula.
     * See {@link http://en.wikipedia.org/wiki/Black%E2%80%93Scholes_model#Black-Scholes_formula|Wikipedia page}
     * for pricing puts in addition to calls.
     *
     * @param   {Number} s       Current price of the underlying
     * @param   {Number} k       Strike price
     * @param   {Number} t       Time to experiation in years
     * @param   {Number} v       Volatility as a decimal
     * @param   {Number} r       Anual risk-free interest rate as a decimal
     * @param   {String} callPut The type of option to be priced - "call" or "put"
     * @returns {Number}         Price of the option
     */
    export function blackScholes(s: number, k: number, t: number, v: number, r: number, callPut: "call" | "put"): number;
    /**
     * Black-Scholes option pricing formula and supporting statistical functions.
     * @module black-scholes
     * @author Matt Loppatto <mattloppatto@gmail.com>
     * @copyright 2014 Matt Loppatto
     */
    /**
     * Standard normal cumulative distribution function.  The probability is estimated
     * by expanding the CDF into a series using the first 100 terms.
     * See {@link http://en.wikipedia.org/wiki/Normal_distribution#Cumulative_distribution_function|Wikipedia page}.
     *
     * @param {Number} x The upper bound to integrate over.  This is P{Z <= x} where Z is a standard normal random variable.
     * @returns {Number} The probability that a standard normal random variable will be less than or equal to x
     */
    export function stdNormCDF(x: number): number;
    /**
     * Calcuate omega as defined in the Black-Scholes formula.
     *
     * @param   {Number} s Current price of the underlying
     * @param   {Number} k Strike price
     * @param   {Number} t Time to experiation in years
     * @param   {Number} v Volatility as a decimal
     * @param   {Number} r Anual risk-free interest rate as a decimal
     * @returns {Number} The value of omega
     */
    export function getW(s: number, k: number, t: number, v: number, r: number): number;
}