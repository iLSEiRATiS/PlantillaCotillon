from decimal import Decimal
from django.contrib.admin.sites import AdminSite
from django.contrib.auth import get_user_model
from django.forms.models import inlineformset_factory
from django.test import RequestFactory, TestCase

from orders.admin import (
    OrderAdmin,
    OrderItemAdminForm,
    OrderItemInline,
    PaidOrderAdmin,
    PendingDeliveryOrderAdmin,
    ReviewOrderAdmin,
)
from orders.models import Order, OrderItem, PaidOrder, PendingDeliveryOrder, ReviewOrder
from products.models import Product

User = get_user_model()


class OrderItemPriceUpdateTests(TestCase):
    def setUp(self):
        self.site = AdminSite()
        self.admin = OrderAdmin(Order, self.site)
        self.rf = RequestFactory()
        self.user = User.objects.create_superuser(
            username="adminuser",
            email="admin@test.com",
            password="password123",
        )
        self.product = Product.objects.create(
            user=self.user,
            nombre="Globo Estrella",
            precio=Decimal("500.00"),
            stock=20,
        )
        self.order = Order.objects.create(
            user=self.user,
            nombre="Juan Perez",
            email="juan@test.com",
            direccion="Calle 123",
            ciudad="Buenos Aires",
            total=Decimal("500.00"),
        )
        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            product_name=self.product.nombre,
            cantidad=1,
            precio_unitario=Decimal("500.00"),
        )

    def test_order_item_inline_fields_for_admin_and_operator(self):
        inline = OrderItemInline(Order, self.site)
        req_admin = self.rf.get("/admin/orders/order/1/change/")
        req_admin.user = self.user

        fields_admin = inline.get_fields(req_admin, self.order)
        self.assertIn("actualizar_precio_producto", fields_admin)
        self.assertIn("precio_unitario", fields_admin)

        operator_user = User.objects.create_user(
            username="operator1",
            email="operator@test.com",
            password="password123",
            role="operator",
        )
        req_operator = self.rf.get("/admin/orders/order/1/change/")
        req_operator.user = operator_user

        fields_operator = inline.get_fields(req_operator, self.order)
        self.assertNotIn("actualizar_precio_producto", fields_operator)
        self.assertNotIn("precio_unitario", fields_operator)

    def test_save_formset_updates_product_price_when_checked(self):
        OrderItemFormSet = inlineformset_factory(
            Order,
            OrderItem,
            form=OrderItemAdminForm,
            fields=("product", "cantidad", "precio_unitario", "actualizar_precio_producto"),
            extra=0,
        )
        data = {
            "items-TOTAL_FORMS": "1",
            "items-INITIAL_FORMS": "1",
            "items-MIN_NUM_FORMS": "0",
            "items-MAX_NUM_FORMS": "1000",
            "items-0-id": str(self.order_item.id),
            "items-0-product": str(self.product.id),
            "items-0-cantidad": "2",
            "items-0-precio_unitario": "750.00",
            "items-0-actualizar_precio_producto": "on",
        }
        formset = OrderItemFormSet(data, instance=self.order, prefix="items")
        self.assertTrue(formset.is_valid(), formset.errors)

        request = self.rf.post(f"/admin/orders/order/{self.order.id}/change/", data)
        request.user = self.user
        # Django messages support
        from django.contrib.messages.storage.fallback import FallbackStorage
        setattr(request, "session", {})
        messages = FallbackStorage(request)
        setattr(request, "_messages", messages)

        self.admin.save_formset(request, None, formset, change=True)

        self.product.refresh_from_db()
        self.assertEqual(self.product.precio, Decimal("750.00"))

        self.order_item.refresh_from_db()
        self.assertEqual(self.order_item.precio_unitario, Decimal("750.00"))

    def test_save_formset_does_not_update_product_price_when_unchecked(self):
        OrderItemFormSet = inlineformset_factory(
            Order,
            OrderItem,
            form=OrderItemAdminForm,
            fields=("product", "cantidad", "precio_unitario", "actualizar_precio_producto"),
            extra=0,
        )
        data = {
            "items-TOTAL_FORMS": "1",
            "items-INITIAL_FORMS": "1",
            "items-MIN_NUM_FORMS": "0",
            "items-MAX_NUM_FORMS": "1000",
            "items-0-id": str(self.order_item.id),
            "items-0-product": str(self.product.id),
            "items-0-cantidad": "2",
            "items-0-precio_unitario": "300.00",
            # Sin actualizar_precio_producto (descuento especial exclusivo para este pedido)
        }
        formset = OrderItemFormSet(data, instance=self.order, prefix="items")
        self.assertTrue(formset.is_valid(), formset.errors)

        request = self.rf.post(f"/admin/orders/order/{self.order.id}/change/", data)
        request.user = self.user
        from django.contrib.messages.storage.fallback import FallbackStorage
        setattr(request, "session", {})
        messages = FallbackStorage(request)
        setattr(request, "_messages", messages)

        self.admin.save_formset(request, None, formset, change=True)

        self.product.refresh_from_db()
        # El precio original del producto en la tienda no debe cambiar
        self.assertEqual(self.product.precio, Decimal("500.00"))

        self.order_item.refresh_from_db()
        self.assertEqual(self.order_item.precio_unitario, Decimal("300.00"))

    def test_save_formset_updates_attribute_price_if_variant_present(self):
        prod_with_attrs = Product.objects.create(
            user=self.user,
            nombre="Vela Número",
            precio=Decimal("1000.00"),
            atributos_precio={"Color": {"Dorado": 1000.0, "Plateado": 900.0}},
            stock=15,
        )
        item_variant = OrderItem.objects.create(
            order=self.order,
            product=prod_with_attrs,
            product_name="Vela Número",
            cantidad=1,
            precio_unitario=Decimal("1000.00"),
            atributos={"Color": "Dorado"},
        )

        OrderItemFormSet = inlineformset_factory(
            Order,
            OrderItem,
            form=OrderItemAdminForm,
            fields=("product", "cantidad", "precio_unitario", "actualizar_precio_producto"),
            extra=0,
        )
        data = {
            "items-TOTAL_FORMS": "1",
            "items-INITIAL_FORMS": "1",
            "items-MIN_NUM_FORMS": "0",
            "items-MAX_NUM_FORMS": "1000",
            "items-0-id": str(item_variant.id),
            "items-0-product": str(prod_with_attrs.id),
            "items-0-cantidad": "1",
            "items-0-precio_unitario": "1250.00",
            "items-0-actualizar_precio_producto": "on",
        }
        formset = OrderItemFormSet(data, instance=self.order, prefix="items")
        self.assertTrue(formset.is_valid(), formset.errors)

        request = self.rf.post(f"/admin/orders/order/{self.order.id}/change/", data)
        request.user = self.user
        from django.contrib.messages.storage.fallback import FallbackStorage
        setattr(request, "session", {})
        messages = FallbackStorage(request)
        setattr(request, "_messages", messages)

        self.admin.save_formset(request, None, formset, change=True)

        prod_with_attrs.refresh_from_db()
        self.assertEqual(prod_with_attrs.precio, Decimal("1250.00"))
        self.assertEqual(prod_with_attrs.atributos_precio["Color"]["Dorado"], 1250.0)
        # La otra variante no debe modificarse
        self.assertEqual(prod_with_attrs.atributos_precio["Color"]["Plateado"], 900.0)

    def test_manual_order_item_is_saved_without_catalog_product(self):
        OrderItemFormSet = inlineformset_factory(
            Order,
            OrderItem,
            form=OrderItemAdminForm,
            fields=("product", "product_name", "cantidad", "precio_unitario", "actualizar_precio_producto"),
            extra=0,
        )
        data = {
            "items-TOTAL_FORMS": "1",
            "items-INITIAL_FORMS": "0",
            "items-MIN_NUM_FORMS": "0",
            "items-MAX_NUM_FORMS": "1000",
            "items-0-product": "",
            "items-0-product_name": "Globo metalizado especial x10",
            "items-0-cantidad": "3",
            "items-0-precio_unitario": "425.50",
        }
        formset = OrderItemFormSet(data, instance=self.order, prefix="items")
        self.assertTrue(formset.is_valid(), formset.errors)

        manual_item = formset.save()[0]
        self.assertIsNone(manual_item.product)
        self.assertEqual(manual_item.product_name, "Globo metalizado especial x10")
        self.assertEqual(manual_item.subtotal, Decimal("1276.50"))

    def test_item_requires_catalog_product_or_manual_name(self):
        form = OrderItemAdminForm(data={
            "cantidad": "1",
            "precio_unitario": "100.00",
            "product_name": "",
        })

        self.assertFalse(form.is_valid())
        self.assertIn("product_name", form.errors)


class OrderWorkflowAdminTests(TestCase):
    def setUp(self):
        self.site = AdminSite()
        self.order_admin = OrderAdmin(Order, self.site)
        self.review_order_admin = ReviewOrderAdmin(ReviewOrder, self.site)
        self.pending_delivery_admin = PendingDeliveryOrderAdmin(PendingDeliveryOrder, self.site)
        self.paid_order_admin = PaidOrderAdmin(PaidOrder, self.site)
        self.rf = RequestFactory()
        self.user = User.objects.create_superuser(
            username="superadmin",
            email="superadmin@test.com",
            password="password123",
        )
        self.order_pending = Order.objects.create(
            user=self.user,
            nombre="Cliente Pendiente",
            email="pendiente@test.com",
            direccion="Calle 1",
            ciudad="CABA",
            status="created",
            total=Decimal("100.00"),
        )
        self.order_approved = Order.objects.create(
            user=self.user,
            nombre="Cliente Aprobado",
            email="aprobado@test.com",
            direccion="Calle 2",
            ciudad="CABA",
            status="approved",
            total=Decimal("200.00"),
        )
        self.order_review = Order.objects.create(
            user=self.user,
            nombre="Cliente A Revisar",
            email="revisar@test.com",
            direccion="Calle 2B",
            ciudad="CABA",
            status="review",
            total=Decimal("250.00"),
        )
        self.order_pending_delivery = Order.objects.create(
            user=self.user,
            nombre="Cliente Pendiente de Entrega",
            email="entrega@test.com",
            direccion="Calle 4",
            ciudad="CABA",
            status="shipped",
            total=Decimal("400.00"),
        )
        self.order_paid = Order.objects.create(
            user=self.user,
            nombre="Cliente Pagado",
            email="pagado@test.com",
            direccion="Calle 3",
            ciudad="CABA",
            status="paid",
            total=Decimal("300.00"),
        )

    def _make_post_request(self, path):
        req = self.rf.post(path)
        req.user = self.user
        setattr(req, "session", {})
        from django.contrib.messages.storage.fallback import FallbackStorage
        setattr(req, "_messages", FallbackStorage(req))
        return req

    def test_order_admin_queryset_only_processing(self):
        req = self.rf.get("/admin/orders/order/")
        req.user = self.user
        qs = self.order_admin.get_queryset(req)

        self.assertIn(self.order_pending, qs)
        self.assertIn(self.order_approved, qs)
        self.assertNotIn(self.order_review, qs)
        self.assertNotIn(self.order_pending_delivery, qs)
        self.assertNotIn(self.order_paid, qs)

    def test_review_order_admin_queryset_only_review(self):
        req = self.rf.get("/admin/orders/revieworder/")
        req.user = self.user
        qs = self.review_order_admin.get_queryset(req)

        self.assertIn(self.order_review, qs)
        self.assertNotIn(self.order_pending, qs)
        self.assertNotIn(self.order_approved, qs)
        self.assertNotIn(self.order_pending_delivery, qs)
        self.assertNotIn(self.order_paid, qs)

    def test_pending_delivery_admin_queryset_only_delivery(self):
        req = self.rf.get("/admin/orders/pendingdeliveryorder/")
        req.user = self.user
        qs = self.pending_delivery_admin.get_queryset(req)

        self.assertIn(self.order_pending_delivery, qs)
        self.assertNotIn(self.order_pending, qs)
        self.assertNotIn(self.order_review, qs)
        self.assertNotIn(self.order_paid, qs)

    def test_paid_order_admin_queryset_only_paid(self):
        req = self.rf.get("/admin/orders/paidorder/")
        req.user = self.user
        qs = self.paid_order_admin.get_queryset(req)

        self.assertIn(self.order_paid, qs)
        self.assertNotIn(self.order_pending, qs)
        self.assertNotIn(self.order_review, qs)
        self.assertNotIn(self.order_pending_delivery, qs)

    # --- MOVING FROM PROCESAR ---
    def test_move_from_procesar_to_revisar(self):
        req = self._make_post_request("/admin/orders/order/")
        self.order_admin.mover_a_revisar(req, Order.objects.filter(pk=self.order_pending.pk))
        self.order_pending.refresh_from_db()
        self.assertEqual(self.order_pending.status, "review")

    def test_move_from_procesar_to_entregar(self):
        req = self._make_post_request("/admin/orders/order/")
        self.order_admin.mover_a_entregar(req, Order.objects.filter(pk=self.order_pending.pk))
        self.order_pending.refresh_from_db()
        self.assertEqual(self.order_pending.status, "shipped")

    def test_move_from_procesar_to_pagados(self):
        req = self._make_post_request("/admin/orders/order/")
        self.order_admin.mover_a_pagados(req, Order.objects.filter(pk=self.order_pending.pk))
        self.order_pending.refresh_from_db()
        self.assertEqual(self.order_pending.status, "paid")

    # --- MOVING FROM REVISAR ---
    def test_move_from_revisar_to_procesar(self):
        req = self._make_post_request("/admin/orders/revieworder/")
        self.review_order_admin.mover_a_procesar(req, ReviewOrder.objects.filter(pk=self.order_review.pk))
        self.order_review.refresh_from_db()
        self.assertEqual(self.order_review.status, "created")

    def test_move_from_revisar_to_entregar(self):
        req = self._make_post_request("/admin/orders/revieworder/")
        self.review_order_admin.mover_a_entregar(req, ReviewOrder.objects.filter(pk=self.order_review.pk))
        self.order_review.refresh_from_db()
        self.assertEqual(self.order_review.status, "shipped")

    def test_move_from_revisar_to_pagados(self):
        req = self._make_post_request("/admin/orders/revieworder/")
        self.review_order_admin.mover_a_pagados(req, ReviewOrder.objects.filter(pk=self.order_review.pk))
        self.order_review.refresh_from_db()
        self.assertEqual(self.order_review.status, "paid")

    # --- MOVING FROM ENTREGAR ---
    def test_move_from_entregar_to_procesar(self):
        req = self._make_post_request("/admin/orders/pendingdeliveryorder/")
        self.pending_delivery_admin.mover_a_procesar(req, PendingDeliveryOrder.objects.filter(pk=self.order_pending_delivery.pk))
        self.order_pending_delivery.refresh_from_db()
        self.assertEqual(self.order_pending_delivery.status, "created")

    def test_move_from_entregar_to_revisar(self):
        req = self._make_post_request("/admin/orders/pendingdeliveryorder/")
        self.pending_delivery_admin.mover_a_revisar(req, PendingDeliveryOrder.objects.filter(pk=self.order_pending_delivery.pk))
        self.order_pending_delivery.refresh_from_db()
        self.assertEqual(self.order_pending_delivery.status, "review")

    def test_move_from_entregar_to_pagados(self):
        req = self._make_post_request("/admin/orders/pendingdeliveryorder/")
        self.pending_delivery_admin.mover_a_pagados(req, PendingDeliveryOrder.objects.filter(pk=self.order_pending_delivery.pk))
        self.order_pending_delivery.refresh_from_db()
        self.assertEqual(self.order_pending_delivery.status, "paid")

    # --- MOVING FROM PAGADOS ---
    def test_move_from_pagados_to_procesar(self):
        req = self._make_post_request("/admin/orders/paidorder/")
        self.paid_order_admin.mover_a_procesar(req, PaidOrder.objects.filter(pk=self.order_paid.pk))
        self.order_paid.refresh_from_db()
        self.assertEqual(self.order_paid.status, "created")

    def test_move_from_pagados_to_revisar(self):
        req = self._make_post_request("/admin/orders/paidorder/")
        self.paid_order_admin.mover_a_revisar(req, PaidOrder.objects.filter(pk=self.order_paid.pk))
        self.order_paid.refresh_from_db()
        self.assertEqual(self.order_paid.status, "review")

    def test_move_from_pagados_to_entregar(self):
        req = self._make_post_request("/admin/orders/paidorder/")
        self.paid_order_admin.mover_a_entregar(req, PaidOrder.objects.filter(pk=self.order_paid.pk))
        self.order_paid.refresh_from_db()
        self.assertEqual(self.order_paid.status, "shipped")

    # --- BACKWARD COMPATIBILITY ALIASES ---
    def test_compatibility_action_aliases(self):
        req = self._make_post_request("/admin/orders/order/")
        self.order_admin.marcar_pagado(req, Order.objects.filter(pk=self.order_pending.pk))
        self.order_pending.refresh_from_db()
        self.assertEqual(self.order_pending.status, "paid")

        self.paid_order_admin.marcar_pendiente_entrega(req, PaidOrder.objects.filter(pk=self.order_paid.pk))
        self.order_paid.refresh_from_db()
        self.assertEqual(self.order_paid.status, "shipped")

        self.pending_delivery_admin.devolver_a_pagados(req, PendingDeliveryOrder.objects.filter(pk=self.order_pending_delivery.pk))
        self.order_pending_delivery.refresh_from_db()
        self.assertEqual(self.order_pending_delivery.status, "paid")

    def test_changelist_view_has_accurate_counts(self):
        req = self.rf.get("/admin/orders/order/")
        req.user = self.user
        setattr(req, "session", {})
        from django.contrib.messages.storage.fallback import FallbackStorage
        setattr(req, "_messages", FallbackStorage(req))

        resp = self.order_admin.changelist_view(req)
        self.assertEqual(resp.context_data["pending_orders_count"], 2)
        self.assertEqual(resp.context_data["review_orders_count"], 1)
        self.assertEqual(resp.context_data["pending_delivery_orders_count"], 1)
        self.assertEqual(resp.context_data["paid_orders_count"], 1)

    def test_admin_app_models_ordered_sequence(self):
        from django.contrib import admin
        req = self.rf.get("/admin/")
        req.user = self.user
        apps = admin.site.get_app_list(req)
        orders_app = next(a for a in apps if a["app_label"] == "orders")
        model_names = [m["object_name"] for m in orders_app["models"]]
        expected = ["Order", "ReviewOrder", "PendingDeliveryOrder", "PaidOrder"]
        self.assertEqual(model_names, expected)
