import { Decimal } from 'decimal.js';
import { PrismaClient } from '@prisma/client';
const dbDecimal = new (require('@prisma/client/runtime/library')).Decimal(10);
const myDecimal = new Decimal(25);
console.log(myDecimal.minus(dbDecimal).toString());
