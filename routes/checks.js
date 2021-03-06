var express = require('express');
var router = express.Router();
var request = require("request");

router.post('/identity', function(req, res, next) {
  res.json({ "type": "identityCheck", "passed": true, "reason": "" })
});

router.post('/property', function(req, res, next) {

  request("https://hmlr-ds-propertyapi.eu-gb.mybluemix.net/v1/properties/" + req.body.uprn, function(error, response, body) {
    var propertyInfo = JSON.parse(body);

    if (propertyInfo["value"] > 3000000) {
        res.json({ "type": "propertyCheck", "passed": false, "reason": "Property value over £3000000" })
    }
    else {
        res.json({ "type": "propertyCheck", "passed": true, "reason": "" })
    }
  });
});

router.post('/affordability', function(req, res, next) {

  request("https://hmlr-ds-propertyapi.eu-gb.mybluemix.net/v1/properties/" + req.body.uprn, function(error, response, body) {
    var propertyInfo = JSON.parse(body);

    request("https://hmlr-ds-personapi.eu-gb.mybluemix.net/v1/people/" + req.body.person_id, function(error, response, body) {
        var personInfo = JSON.parse(body);

        loan_term = req.body.term
        loan_amount = req.body.loan_amount
        loan_threshold = 0.9
        loan_term_threshold = 35

        expenditure_threshold = 0.7
        expenditure_income_percentage = personInfo["finances"]["montly"] / personInfo["finances"]["montly income"]

        if (expenditure_income_percentage > expenditure_threshold) {
            res.json({ "type": "affordabilityCheck", "passed": false, "reason": "Expenditure greater " + expenditure_threshold*100 + " percent of income" })
        }

        else if (loan_amount / propertyInfo["value"] > loan_threshold) {
            res.json({ "type": "affordabilityCheck", "passed": false, "reason": "Loan to value is greater than " + loan_threshold*100 + " percent" })
        }

        else if (loan_term > loan_term_threshold) {
            res.json({ "type": "affordabilityCheck", "passed": false, "reason": "Loan term is greater than " + loan_term_threshold })
        }

        else {
            res.json({ "type": "affordabilityCheck", "passed": true, "reason": "" })
        }
    });
  });
});

router.post('/credit', function(req, res, next) {

  request("https://hmlr-ds-personapi.eu-gb.mybluemix.net/v1/people/" + req.body.person_id, function(error, response, body) {
    var personInfo = JSON.parse(body);

    credit_threshold = 400

    if (personInfo["finances"]["credit score"] < credit_threshold) {
        res.json({ "type": "creditCheck", "passed": false, "reason": "Credit score is less than " + credit_threshold })
    }
    else {
        res.json({ "type": "creditCheck", "passed": true, "reason": "" })
    }
  });
});

router.post('/earnings', function(req, res, next) {

  request("https://hmlr-ds-personapi.eu-gb.mybluemix.net/v1/people/" + req.body.person_id, function(error, response, body) {
    var personInfo = JSON.parse(body);

    earnings_threshold = 16000

    if (personInfo["finances"]["income"] < earnings_threshold) {
        res.json({ "type": "earningsCheck", "passed": false, "reason": "Income is less than " + earnings_threshold })
    }
    else {
        res.json({ "type": "earningsCheck", "passed": true, "reason": "" })
    }
  });
});

module.exports = router;
