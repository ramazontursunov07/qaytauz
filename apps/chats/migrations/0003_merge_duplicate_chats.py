from django.db import migrations


def merge_duplicate_chats(apps, schema_editor):
    Chat = apps.get_model('chats', 'Chat')

    groups = {}
    for chat in Chat.objects.all().order_by('id'):
        participant_ids = frozenset(chat.participants.values_list('id', flat=True))
        key = (participant_ids, chat.product_id)
        groups.setdefault(key, []).append(chat.id)

    for chat_ids in groups.values():
        if len(chat_ids) <= 1:
            continue
        # Eng birinchi (eski) chat qoladi, qolganlarining xabarlari shu yerga ko'chiriladi.
        canonical_id = chat_ids[0]
        duplicate_ids = chat_ids[1:]

        Message = apps.get_model('chats', 'Message')
        Message.objects.filter(chat_id__in=duplicate_ids).update(chat_id=canonical_id)
        Chat.objects.filter(id__in=duplicate_ids).delete()


def noop_reverse(apps, schema_editor):
    # Birlashtirilgan chatlarni orqaga qaytarib bo'lmaydi (ma'lumot yo'qolgan bo'lardi),
    # shuning uchun reverse - bo'sh amal.
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('chats', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(merge_duplicate_chats, noop_reverse),
    ]
