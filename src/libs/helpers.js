import { Op } from 'sequelize';

export const getFieldExpressionWhere = (value, operator) => {
    let expression = "";
    if ((value && value != "") && (operator)) {
        if (operator === Op.like && isNaN(value)) {
            expression = { [operator]: "%" + value + "%" };
        } else if (operator === Op.like && !isNaN(value)) {
            expression = {[Op.eq]: value }
        } else {
            expression = {[operator]: value }
        }
    }
    return expression;
}