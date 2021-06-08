const { Schema, model } = require('mongoose');

const UserSchema = Schema({
	email: {
		type: String,
		required: true,
	},
	name: String,
	password: {
		type: String,
		required: true,
	},
	avatarUrl: String,
	resetToken: String,
	resetTokenExp: Date,
	cart: {
		items: [
			{
				count: {
					type: Number,
					required: true,
					default: 1,
				},
				courseId: {
					type: Schema.Types.ObjectId,
					ref: 'Course',
					required: true,
				},
			},
		],
	},
});

UserSchema.methods.addToCart = function (course) {
	const items = [...this.cart.items];
	const idx = items.findIndex(
		item => item.courseId.toString() === course._id.toString()
	);

	if (idx >= 0) {
		items[idx].count++;
	} else {
		items.push({
			courseId: course._id,
			count: 1,
		});
	}

	this.cart = { items };
	return this.save();
};

UserSchema.methods.removeFromCart = function (id) {
	let items = [...this.cart.items];
	const idx = items.findIndex(
		item => item.courseId.toString() === id.toString()
	);

	if (items[idx].count === 1) {
		items = items.filter(
			item => item.courseId.toString() !== id.toString()
		);
	} else {
		items[idx].count--;
	}

	this.cart = { items };
	return this.save();
};

UserSchema.methods.clearCart = function () {
	this.cart = { items: [] };
	return this.save();
};

module.exports = model('User', UserSchema);
